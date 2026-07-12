import { NextResponse } from "next/server";

import { buildLocalPortfolioAnswer } from "@/lib/ai/portfolio-fallback";
import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";
import {
  createOpenAiGeneralAnswerStream,
  fetchOpenAiGeneralAnswer,
  getOpenAiProviderConfig,
  isOpenAiProviderConfigured,
  type OpenAiProviderConfig,
} from "@/lib/ai/openai-provider";
import {
  normalizePortfolioHistory,
  validatePortfolioQuestion,
  type PortfolioChatMessage,
} from "@/lib/ai/portfolio-prompt";
import {
  consumePortfolioRateLimit,
  type PortfolioRateLimitResult,
} from "@/lib/ai/portfolio-rate-limit";
import {
  createResponsePayload,
  createTextMessage,
  type PortfolioAiResponsePayload,
} from "@/lib/ai/portfolio-response";
import {
  encodePortfolioAiStreamEvent,
  PORTFOLIO_AI_STREAM_CONTENT_TYPE,
  PORTFOLIO_AI_STREAM_MEDIA_TYPE,
  type PortfolioAiStreamEvent,
} from "@/lib/ai/portfolio-stream";

export const runtime = "nodejs";

type PortfolioAiRequestBody = {
  question?: unknown;
  history?: unknown;
};

type RequestBodyResult =
  | {
      ok: true;
      body: PortfolioAiRequestBody;
    }
  | {
      ok: false;
      kind: "invalid" | "too_large";
    };

type ResponseContext = {
  rateLimit: PortfolioRateLimitResult;
  requestId: string;
};

const STREAM_FAILURE_MESSAGE =
  "I could not complete that response. Please try again, or ask me about Nikki's portfolio.";

async function readRequestBody(request: Request): Promise<RequestBodyResult> {
  const contentLength = Number(request.headers.get("content-length"));

  if (
    Number.isFinite(contentLength) &&
    contentLength > PORTFOLIO_AI_LIMITS.requestBodyBytes
  ) {
    return { kind: "too_large", ok: false };
  }

  if (!request.body) {
    return { body: {}, ok: true };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let rawBody = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        rawBody += decoder.decode();
        break;
      }

      bytesRead += value.byteLength;

      if (bytesRead > PORTFOLIO_AI_LIMITS.requestBodyBytes) {
        await reader.cancel();
        return { kind: "too_large", ok: false };
      }

      rawBody += decoder.decode(value, { stream: true });
    }

    const parsed = JSON.parse(rawBody) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { kind: "invalid", ok: false };
    }

    return {
      body: parsed as PortfolioAiRequestBody,
      ok: true,
    };
  } catch {
    return { kind: "invalid", ok: false };
  } finally {
    reader.releaseLock();
  }
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const candidate =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "anonymous";

  return candidate.slice(0, 128) || "anonymous";
}

function createResponseHeaders(
  context: ResponseContext,
  options?: { stream?: boolean; retryAfter?: number },
) {
  const headers = new Headers({
    "Cache-Control": options?.stream
      ? "no-store, no-transform"
      : "private, no-store",
    "RateLimit-Limit": String(context.rateLimit.limit),
    "RateLimit-Policy": `${context.rateLimit.limit};w=${Math.ceil(
      PORTFOLIO_AI_LIMITS.rateLimitWindowMs / 1_000,
    )}`,
    "RateLimit-Remaining": String(context.rateLimit.remaining),
    "RateLimit-Reset": String(context.rateLimit.resetAfterSeconds),
    "X-Content-Type-Options": "nosniff",
    "X-RateLimit-Scope": "instance",
    "X-Request-ID": context.requestId,
  });

  if (options?.stream) {
    headers.set("Content-Type", PORTFOLIO_AI_STREAM_CONTENT_TYPE);
  }

  if (options?.retryAfter) {
    headers.set("Retry-After", String(options.retryAfter));
  }

  return headers;
}

function jsonResponse(
  payload: PortfolioAiResponsePayload,
  context: ResponseContext,
  status = 200,
) {
  return NextResponse.json(payload, {
    headers: createResponseHeaders(context),
    status,
  });
}

function wantsStream(request: Request): boolean {
  return (
    request.headers
      .get("accept")
      ?.toLowerCase()
      .includes(PORTFOLIO_AI_STREAM_MEDIA_TYPE) ?? false
  );
}

function enqueueStreamEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: PortfolioAiStreamEvent,
): boolean {
  try {
    controller.enqueue(encodePortfolioAiStreamEvent(event));
    return true;
  } catch {
    return false;
  }
}

function closeStream(
  controller: ReadableStreamDefaultController<Uint8Array>,
) {
  try {
    controller.close();
  } catch {
    // The browser may already have cancelled the response body.
  }
}

function streamPayloadResponse(
  payload: PortfolioAiResponsePayload,
  context: ResponseContext,
  status = 200,
  retryAfter?: number,
) {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      enqueueStreamEvent(controller, {
        type: "metadata",
        mode: payload.mode,
      });
      enqueueStreamEvent(controller, {
        type: "message",
        message: payload.message,
      });
      enqueueStreamEvent(controller, {
        type: "done",
        mode: payload.mode,
      });
      closeStream(controller);
    },
  });

  return new Response(body, {
    headers: createResponseHeaders(context, {
      retryAfter,
      stream: true,
    }),
    status,
  });
}

function payloadResponse(
  request: Request,
  payload: PortfolioAiResponsePayload,
  context: ResponseContext,
  status = 200,
  retryAfter?: number,
) {
  if (wantsStream(request)) {
    return streamPayloadResponse(payload, context, status, retryAfter);
  }

  const headers = createResponseHeaders(context, { retryAfter });

  return NextResponse.json(payload, { headers, status });
}

function validationResponse(
  request: Request,
  context: ResponseContext,
  message: string,
  status = 400,
) {
  return payloadResponse(
    request,
    createResponsePayload(createTextMessage(message), "validation_error"),
    context,
    status,
  );
}

function rateLimitResponse(request: Request, context: ResponseContext) {
  return payloadResponse(
    request,
    createResponsePayload(
      createTextMessage(
        "I am receiving many questions right now. Please wait a moment and try again.",
      ),
      "rate_limited",
    ),
    context,
    429,
    context.rateLimit.resetAfterSeconds,
  );
}

function getProviderErrorSummary(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: "UnknownProviderError" };
  }

  const status =
    "status" in error && typeof error.status === "number"
      ? error.status
      : undefined;

  return {
    name: error.name || "ProviderError",
    ...(status ? { status } : {}),
  };
}

function logProviderError(requestId: string, error: unknown) {
  console.error("Portfolio AI provider request failed.", {
    requestId,
    ...getProviderErrorSummary(error),
  });
}

function createProviderStreamResponse(
  request: Request,
  context: ResponseContext,
  config: OpenAiProviderConfig,
  question: string,
  history: PortfolioChatMessage[],
) {
  const abortController = new AbortController();
  const abortProvider = () => abortController.abort();

  if (request.signal.aborted) {
    abortProvider();
  } else {
    request.signal.addEventListener("abort", abortProvider, { once: true });
  }

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let hasOutput = false;
      let outputCharacters = 0;
      let outputLimitReached = false;
      let providerCompleted = false;

      enqueueStreamEvent(controller, {
        type: "metadata",
        mode: "ai",
      });

      try {
        const providerStream = await createOpenAiGeneralAnswerStream(
          config,
          question,
          history,
          abortController.signal,
        );

        for await (const event of providerStream) {
          if (abortController.signal.aborted) {
            break;
          }

          if (
            event.type === "response.output_text.delta" ||
            event.type === "response.refusal.delta"
          ) {
            if (event.delta) {
              const remainingCharacters =
                PORTFOLIO_AI_LIMITS.providerOutputCharacters - outputCharacters;
              const safeDelta = event.delta.slice(0, remainingCharacters);

              if (safeDelta) {
                hasOutput = true;
                outputCharacters += safeDelta.length;
                enqueueStreamEvent(controller, {
                  type: "text_delta",
                  delta: safeDelta,
                });
              }

              if (
                outputCharacters >=
                PORTFOLIO_AI_LIMITS.providerOutputCharacters
              ) {
                outputLimitReached = true;
                providerCompleted = true;
                break;
              }
            }

            continue;
          }

          if (event.type === "response.completed") {
            providerCompleted = true;
            continue;
          }

          if (
            event.type === "response.failed" ||
            event.type === "response.incomplete" ||
            event.type === "error"
          ) {
            throw new Error(`Provider stream ended with ${event.type}.`);
          }
        }

        if (abortController.signal.aborted && !outputLimitReached) {
          return;
        }

        if (!providerCompleted || !hasOutput) {
          throw new Error("Provider stream ended without a complete answer.");
        }

        enqueueStreamEvent(controller, {
          type: "done",
          mode: "ai",
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          logProviderError(context.requestId, error);
          enqueueStreamEvent(controller, {
            type: "error",
            message: STREAM_FAILURE_MESSAGE,
            retryable: true,
          });
          enqueueStreamEvent(controller, {
            type: "done",
            mode: "safe_fallback",
          });
        }
      } finally {
        request.signal.removeEventListener("abort", abortProvider);
        closeStream(controller);
      }
    },
    cancel() {
      abortProvider();
    },
  });

  return new Response(body, {
    headers: createResponseHeaders(context, { stream: true }),
    status: 200,
  });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = consumePortfolioRateLimit(getClientKey(request));
  const context: ResponseContext = { rateLimit, requestId };

  if (rateLimit.limited) {
    return rateLimitResponse(request, context);
  }

  const bodyResult = await readRequestBody(request);

  if (!bodyResult.ok) {
    return validationResponse(
      request,
      context,
      bodyResult.kind === "too_large"
        ? "The request is too large. Please send a shorter question and conversation."
        : "Please send a valid JSON request.",
      bodyResult.kind === "too_large" ? 413 : 400,
    );
  }

  const validation = validatePortfolioQuestion(bodyResult.body.question);

  if (!validation.ok) {
    return validationResponse(request, context, validation.message);
  }

  const question = validation.question;
  const history = normalizePortfolioHistory(bodyResult.body.history);
  const localAnswer = buildLocalPortfolioAnswer(question);

  if (localAnswer.isKnownIntent) {
    return payloadResponse(request, localAnswer, context);
  }

  const config = getOpenAiProviderConfig();

  if (!isOpenAiProviderConfigured(config)) {
    return payloadResponse(request, localAnswer, context);
  }

  if (wantsStream(request)) {
    return createProviderStreamResponse(
      request,
      context,
      config,
      question,
      history,
    );
  }

  try {
    const providerAnswer = await fetchOpenAiGeneralAnswer(
      config,
      question,
      history,
    );

    if (!providerAnswer) {
      return jsonResponse(localAnswer, context);
    }

    return jsonResponse(
      createResponsePayload(createTextMessage(providerAnswer), "ai"),
      context,
    );
  } catch (error) {
    logProviderError(requestId, error);
    return jsonResponse(localAnswer, context);
  }
}
