import "server-only";

import OpenAI from "openai";

import {
  buildGeneralAssistantInstructions,
  buildOpenAiConversationInput,
  type PortfolioChatMessage,
} from "@/lib/ai/portfolio-prompt";
import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";

export type OpenAiProviderConfig = {
  apiKey: string;
  baseURL?: string;
  enabled: boolean;
  model: string;
};

function readBoolean(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

function getLocalTestBaseURL(): string | undefined {
  if (!readBoolean(process.env.PORTFOLIO_AI_TEST_MODE)) {
    return undefined;
  }

  const value = process.env.PORTFOLIO_AI_TEST_BASE_URL?.trim();

  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const isLocalHost =
      url.hostname === "127.0.0.1" || url.hostname === "localhost";

    if (url.protocol !== "http:" || !isLocalHost) {
      return undefined;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function getOpenAiProviderConfig(): OpenAiProviderConfig {
  return {
    apiKey: process.env.OPENAI_API_KEY?.trim() || "",
    baseURL: getLocalTestBaseURL(),
    enabled: readBoolean(process.env.PORTFOLIO_AI_ENABLE_GENERIC),
    model: process.env.OPENAI_MODEL?.trim() || "",
  };
}

export function isOpenAiProviderConfigured(
  config: OpenAiProviderConfig,
): boolean {
  return Boolean(config.enabled && config.apiKey && config.model);
}

function createOpenAiClient(config: OpenAiProviderConfig) {
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    maxRetries: PORTFOLIO_AI_LIMITS.providerMaxRetries,
    timeout: PORTFOLIO_AI_LIMITS.providerTimeoutMs,
  });
}

function buildResponseRequest(
  config: OpenAiProviderConfig,
  question: string,
  history: PortfolioChatMessage[],
) {
  return {
    input: buildOpenAiConversationInput(question, history),
    instructions: buildGeneralAssistantInstructions(),
    max_output_tokens: PORTFOLIO_AI_LIMITS.providerOutputTokens,
    model: config.model,
    store: false,
  };
}

export async function fetchOpenAiGeneralAnswer(
  config: OpenAiProviderConfig,
  question: string,
  history: PortfolioChatMessage[],
): Promise<string> {
  const client = createOpenAiClient(config);

  const response = await client.responses.create({
    ...buildResponseRequest(config, question, history),
    stream: false,
  });

  return response.output_text
    .trim()
    .slice(0, PORTFOLIO_AI_LIMITS.providerOutputCharacters);
}

export async function createOpenAiGeneralAnswerStream(
  config: OpenAiProviderConfig,
  question: string,
  history: PortfolioChatMessage[],
  signal: AbortSignal,
) {
  const client = createOpenAiClient(config);

  return client.responses.create(
    {
      ...buildResponseRequest(config, question, history),
      stream: true,
    },
    { signal },
  );
}
