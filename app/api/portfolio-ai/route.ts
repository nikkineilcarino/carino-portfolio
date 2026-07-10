import { NextResponse } from "next/server";

import { buildLocalPortfolioAnswer } from "@/lib/ai/portfolio-fallback";
import {
  buildPortfolioPromptMessages,
  normalizePortfolioHistory,
  validatePortfolioQuestion,
} from "@/lib/ai/portfolio-prompt";
import {
  createResponsePayload,
  createTextMessage,
  parseAssistantMessageFromProvider,
  type PortfolioAiResponsePayload,
} from "@/lib/ai/portfolio-response";

export const runtime = "nodejs";

type PortfolioAiRequestBody = {
  question?: unknown;
  history?: unknown;
};

type ChatCompletionChoice = {
  message?: {
    content?: unknown;
  };
};

type ChatCompletionResponse = {
  choices?: ChatCompletionChoice[];
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const DEFAULT_AI_BASE_URL = "https://api.openai.com/v1/chat/completions";
const PROVIDER_TIMEOUT_MS = 8000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 24;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getAiProviderConfig() {
  return {
    apiKey: process.env.AI_API_KEY?.trim() || "",
    model: process.env.AI_MODEL?.trim() || "",
    baseUrl: process.env.AI_BASE_URL?.trim() || DEFAULT_AI_BASE_URL,
  };
}

function isConfigured(config: ReturnType<typeof getAiProviderConfig>) {
  return Boolean(config.apiKey && config.model && config.baseUrl);
}

function extractAssistantAnswer(payload: ChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    return "";
  }

  return content.trim();
}

async function readRequestBody(request: Request): Promise<PortfolioAiRequestBody> {
  try {
    const body = (await request.json()) as PortfolioAiRequestBody;
    return body ?? {};
  } catch {
    return {};
  }
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "anonymous";
  }

  return request.headers.get("x-real-ip")?.trim() || "anonymous";
}

function checkRateLimit(request: Request): boolean {
  const now = Date.now();
  const key = getClientKey(request);
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });

    return false;
  }

  existing.count += 1;

  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

function jsonResponse(
  payload: PortfolioAiResponsePayload,
  init?: ResponseInit,
) {
  return NextResponse.json(payload, init);
}

function validationResponse(message: string) {
  return jsonResponse(
    createResponsePayload(createTextMessage(message), "validation_error"),
    { status: 400 },
  );
}

function rateLimitResponse() {
  return jsonResponse(
    createResponsePayload(
      createTextMessage(
        "I am receiving many questions right now. Please wait a moment and try again.",
      ),
      "rate_limited",
    ),
    { status: 429 },
  );
}

async function fetchProviderAnswer(
  config: ReturnType<typeof getAiProviderConfig>,
  question: string,
  history: ReturnType<typeof normalizePortfolioHistory>,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = windowlessTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  try {
    const response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: buildPortfolioPromptMessages(question, history),
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Provider returned ${response.status}`);
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    return extractAssistantAnswer(payload);
  } finally {
    clearTimeout(timeoutId);
  }
}

function windowlessTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}

export async function POST(request: Request) {
  if (checkRateLimit(request)) {
    return rateLimitResponse();
  }

  const body = await readRequestBody(request);
  const validation = validatePortfolioQuestion(body.question);

  if (!validation.ok) {
    return validationResponse(validation.message);
  }

  const question = validation.question;
  const history = normalizePortfolioHistory(body.history);
  const localAnswer = buildLocalPortfolioAnswer(question);

  if (localAnswer.isKnownIntent) {
    return jsonResponse(localAnswer);
  }

  const config = getAiProviderConfig();

  if (!isConfigured(config)) {
    return jsonResponse(localAnswer);
  }

  try {
    const providerAnswer = await fetchProviderAnswer(config, question, history);
    const message = parseAssistantMessageFromProvider(providerAnswer);

    if (!message) {
      return jsonResponse(localAnswer);
    }

    return jsonResponse(createResponsePayload(message, "ai"));
  } catch (error) {
    console.error("Portfolio AI provider request failed.", error);
    return jsonResponse(localAnswer);
  }
}
