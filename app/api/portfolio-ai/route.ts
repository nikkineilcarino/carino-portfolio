import { NextResponse } from "next/server";

import { buildLocalPortfolioAnswer } from "@/lib/ai/portfolio-fallback";
import {
  buildPortfolioPromptMessages,
  normalizePortfolioHistory,
  normalizePortfolioQuestion,
} from "@/lib/ai/portfolio-prompt";

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

const DEFAULT_AI_BASE_URL = "https://api.openai.com/v1/chat/completions";

function getAiProviderConfig() {
  return {
    provider: process.env.AI_PROVIDER?.trim() || "openai-compatible",
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

export async function POST(request: Request) {
  const body = await readRequestBody(request);
  const question = normalizePortfolioQuestion(body.question);
  const history = normalizePortfolioHistory(body.history);

  if (!question) {
    return NextResponse.json(
      {
        answer: "Please type a question about Nikki's portfolio first.",
        mode: "validation_error",
      },
      { status: 400 },
    );
  }

  const config = getAiProviderConfig();

  if (!isConfigured(config)) {
    const localAnswer = buildLocalPortfolioAnswer(question);

    return NextResponse.json({
      answer: localAnswer.answer,
      mode: localAnswer.mode,
      provider: config.provider,
    });
  }

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
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          answer:
            "I could not answer that right now. Please try again in a moment.",
          mode: "provider_error",
          provider: config.provider,
        },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as ChatCompletionResponse;
    const answer = extractAssistantAnswer(payload);

    if (!answer) {
      return NextResponse.json(
        {
          answer:
            "I could not answer that right now. Please try again in a moment.",
          mode: "empty_provider_response",
          provider: config.provider,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      answer,
      mode: "ai",
      provider: config.provider,
    });
  } catch {
    return NextResponse.json(
      {
        answer: "I could not answer that right now. Please try again in a moment.",
        mode: "request_failed",
        provider: config.provider,
      },
      { status: 502 },
    );
  }
}
