import { formatPortfolioContextForPrompt } from "@/lib/ai/portfolio-context";

export type PortfolioChatRole = "user" | "assistant";

export type PortfolioChatMessage = {
  role: PortfolioChatRole;
  content: string;
};

export type PortfolioPromptMessage = {
  role: "system" | PortfolioChatRole;
  content: string;
};

export const MAX_PORTFOLIO_QUESTION_LENGTH = 1200;
export const MAX_PORTFOLIO_HISTORY_MESSAGES = 8;
export const MAX_PORTFOLIO_HISTORY_MESSAGE_LENGTH = 1200;

const SYSTEM_INSTRUCTIONS = [
  "You are the AI assistant for Nikki Neil P. Carino's portfolio website.",
  "Answer questions about Nikki's CV, skills, projects, experience, education, certifications, leadership, and contact details using the approved portfolio context.",
  "If a question asks about Nikki and the information is not in the portfolio context, say that the information is not currently provided in the portfolio.",
  "If a question is general and not about Nikki, answer helpfully using general AI knowledge, but do not claim that the answer is a confirmed fact about Nikki.",
  "Do not invent confidential details, screenshots, live demos, metrics, links, employment claims, certificates, private workflows, or private information.",
  "Keep answers professional, concise, and useful for recruiters, clients, and portfolio visitors.",
  "Present yourself as a portfolio AI helper, not as Nikki.",
].join("\n");

export function normalizePortfolioQuestion(question: unknown): string {
  if (typeof question !== "string") {
    return "";
  }

  return question.trim().slice(0, MAX_PORTFOLIO_QUESTION_LENGTH);
}

export function normalizePortfolioHistory(
  history: unknown,
): PortfolioChatMessage[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (message): message is PortfolioChatMessage =>
        Boolean(message) &&
        typeof message === "object" &&
        "role" in message &&
        "content" in message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-MAX_PORTFOLIO_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content
        .trim()
        .slice(0, MAX_PORTFOLIO_HISTORY_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);
}

export function buildPortfolioSystemPrompt(): string {
  return [
    SYSTEM_INSTRUCTIONS,
    "",
    "Approved portfolio context:",
    formatPortfolioContextForPrompt(),
  ].join("\n");
}

export function buildPortfolioPromptMessages(
  question: string,
  history: PortfolioChatMessage[] = [],
): PortfolioPromptMessage[] {
  return [
    {
      role: "system",
      content: buildPortfolioSystemPrompt(),
    },
    ...history,
    {
      role: "user",
      content: question,
    },
  ];
}

export function buildMissingConfigurationAnswer(): string {
  return [
    "Live AI is not configured yet, so I cannot generate a full AI response right now.",
    "The portfolio assistant is prepared to answer questions about Nikki's CV, skills, projects, experience, education, certifications, and contact details once the server-side AI provider settings are added.",
  ].join(" ");
}
