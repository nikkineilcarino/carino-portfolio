import {
  validateAssistantMessage,
  type AssistantMessage,
  type PortfolioAiMode,
} from "@/lib/ai/portfolio-response";

export const PORTFOLIO_AI_STREAM_MEDIA_TYPE = "application/x-ndjson";
export const PORTFOLIO_AI_STREAM_CONTENT_TYPE =
  `${PORTFOLIO_AI_STREAM_MEDIA_TYPE}; charset=utf-8`;

export type PortfolioAiStreamEvent =
  | {
      type: "metadata";
      mode: PortfolioAiMode;
    }
  | {
      type: "text_delta";
      delta: string;
    }
  | {
      type: "message";
      message: AssistantMessage;
    }
  | {
      type: "error";
      message: string;
      retryable: boolean;
    }
  | {
      type: "done";
      mode: PortfolioAiMode;
    };

const portfolioAiModes = new Set<PortfolioAiMode>([
  "local_portfolio_answer",
  "ai",
  "safe_fallback",
  "validation_error",
  "rate_limited",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPortfolioAiMode(value: unknown): value is PortfolioAiMode {
  return typeof value === "string" && portfolioAiModes.has(value as PortfolioAiMode);
}

export function encodePortfolioAiStreamEvent(
  event: PortfolioAiStreamEvent,
): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export function validatePortfolioAiStreamEvent(
  value: unknown,
): PortfolioAiStreamEvent | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    return null;
  }

  if (value.type === "metadata" || value.type === "done") {
    if (!isPortfolioAiMode(value.mode)) {
      return null;
    }

    return {
      type: value.type,
      mode: value.mode,
    };
  }

  if (value.type === "text_delta") {
    if (typeof value.delta !== "string" || value.delta.length === 0) {
      return null;
    }

    return {
      type: "text_delta",
      delta: value.delta,
    };
  }

  if (value.type === "message") {
    const message = validateAssistantMessage(value.message);

    return message
      ? {
          type: "message",
          message,
        }
      : null;
  }

  if (value.type === "error") {
    if (
      typeof value.message !== "string" ||
      !value.message.trim() ||
      typeof value.retryable !== "boolean"
    ) {
      return null;
    }

    return {
      type: "error",
      message: value.message.trim(),
      retryable: value.retryable,
    };
  }

  return null;
}

export function parsePortfolioAiStreamLine(
  line: string,
): PortfolioAiStreamEvent | null {
  const trimmed = line.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return validatePortfolioAiStreamEvent(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

export async function* readPortfolioAiStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<PortfolioAiStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        const event = parsePortfolioAiStreamLine(line);

        if (!event) {
          throw new Error("The portfolio AI stream returned an invalid event.");
        }

        yield event;
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      const event = parsePortfolioAiStreamLine(buffer);

      if (!event) {
        throw new Error("The portfolio AI stream ended with an invalid event.");
      }

      yield event;
    }
  } finally {
    reader.releaseLock();
  }
}
