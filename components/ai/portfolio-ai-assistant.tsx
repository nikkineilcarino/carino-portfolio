"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bot, RotateCcw, Sparkles, X } from "lucide-react";
import { PortfolioAiInput } from "@/components/ai/portfolio-ai-input";
import {
  PortfolioAiMessage,
  type PortfolioAiMessageRole,
} from "@/components/ai/portfolio-ai-message";
import { Button } from "@/components/ui/button";
import {
  createTextMessage,
  validateAssistantMessage,
  type AssistantMessage,
} from "@/lib/ai/portfolio-response";

type PortfolioAiResponse = {
  answer?: unknown;
  message?: unknown;
  mode?: unknown;
};

type PortfolioUiMessage = {
  id: string;
  role: PortfolioAiMessageRole;
  content: string;
  message?: AssistantMessage;
};

const INITIAL_ASSISTANT_MESSAGE = createTextMessage(
  "Hi! I'm Nikki's portfolio AI. Ask me about my experience, skills, projects, education, resume, or the type of opportunities I'm looking for.",
);

const INITIAL_MESSAGE: PortfolioUiMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content: INITIAL_ASSISTANT_MESSAGE.message,
  message: INITIAL_ASSISTANT_MESSAGE,
};

const SUGGESTED_QUESTIONS = [
  "Who are you?",
  "What are your strongest skills?",
  "Tell me about your internship.",
  "Tell me about RecycLens.",
  "Why should we hire you?",
  "Can I download your resume?",
  "How can I contact you?",
];

const MIN_THINKING_DURATION_MS = 350;
const SAFE_CLIENT_FALLBACK = createTextMessage(
  "I can still help with questions about my experience, technical skills, projects, education, resume, and contact details. Try asking me about one of those areas.",
);

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getSafeAssistantMessage(payload: PortfolioAiResponse): AssistantMessage {
  const structuredMessage = validateAssistantMessage(payload.message);

  if (structuredMessage) {
    return structuredMessage;
  }

  if (typeof payload.answer === "string" && payload.answer.trim()) {
    return createTextMessage(payload.answer.trim());
  }

  return SAFE_CLIENT_FALLBACK;
}

export function PortfolioAiAssistant() {
  const panelId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageCounterRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<PortfolioUiMessage[]>([
    INITIAL_MESSAGE,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const createMessage = (
    role: PortfolioAiMessageRole,
    content: string,
    message?: AssistantMessage,
  ): PortfolioUiMessage => {
    messageCounterRef.current += 1;

    return {
      id: `${role}-${messageCounterRef.current}`,
      role,
      content,
      message,
    };
  };

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setInputError("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitQuestion = async (questionOverride?: string) => {
    const question = (questionOverride ?? input).trim();

    if (!question) {
      setInputError("Type a question first.");
      return;
    }

    if (question.length > 1200) {
      setInputError("Please keep your question shorter.");
      return;
    }

    setInputError("");
    setInput("");
    setIsLoading(true);

    const userMessage = createMessage("user", question);
    const history = messages
      .filter((message) => message.id !== INITIAL_MESSAGE.id)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage]);

    try {
      const minimumThinkingDelay = wait(MIN_THINKING_DURATION_MS);
      const response = await fetch("/api/portfolio-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history,
        }),
      });
      const payload = (await response.json()) as PortfolioAiResponse;
      const assistantMessage = getSafeAssistantMessage(payload);

      await minimumThinkingDelay;

      setMessages((current) => [
        ...current,
        createMessage("assistant", assistantMessage.message, assistantMessage),
      ]);
    } catch {
      await wait(MIN_THINKING_DURATION_MS);
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          SAFE_CLIENT_FALLBACK.message,
          SAFE_CLIENT_FALLBACK,
        ),
      ]);
    } finally {
      setIsLoading(false);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <aside
      aria-label="Portfolio AI assistant"
      className="fixed bottom-5 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:right-6"
    >
      {isOpen ? (
        <div
          className="w-[calc(100vw-2rem)] max-w-[25rem] overflow-hidden rounded-md border border-[#D4D4D8] bg-[#FAFAFA] shadow-2xl"
          id={panelId}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#E4E4E7] bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#0F766E] text-white">
                <Bot aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#18181B]">
                  Portfolio AI
                </p>
                <p className="truncate text-xs text-[#52525B]">
                  Nikki Neil P. Cariño
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label="Reset portfolio AI conversation"
                className="min-h-9 px-2 text-xs"
                onClick={resetConversation}
                size="sm"
                type="button"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              <Button
                aria-label="Close portfolio AI assistant"
                className="min-h-9 min-w-9 px-2"
                onClick={() => setIsOpen(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-[min(30rem,62vh)] overflow-y-auto px-3 py-4">
            <div aria-live="polite" className="flex flex-col gap-3">
              {messages.map((message) => (
                <PortfolioAiMessage
                  content={message.content}
                  key={message.id}
                  message={message.message}
                  role={message.role}
                />
              ))}
              {messages.length === 1 && !isLoading ? (
                <div
                  aria-label="Suggested portfolio questions"
                  className="ml-10 flex flex-wrap gap-2"
                >
                  {SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      className="min-h-9 rounded-md border border-[#D4D4D8] bg-white px-3 py-1.5 text-left text-xs font-medium text-[#3F3F46] underline-offset-4 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                      disabled={isLoading}
                      key={question}
                      onClick={() => submitQuestion(question)}
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              ) : null}
              {isLoading ? (
                <div
                  aria-live="polite"
                  className="flex justify-start gap-2"
                  role="status"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#CCFBF1] text-[#0F766E]">
                    <Sparkles
                      aria-hidden="true"
                      className="h-4 w-4 animate-pulse motion-reduce:animate-none"
                    />
                  </span>
                  <p className="rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm leading-6 text-[#52525B]">
                    Thinking...
                  </p>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <PortfolioAiInput
            error={inputError}
            isLoading={isLoading}
            onChange={(value) => {
              setInput(value);
              if (inputError) {
                setInputError("");
              }
            }}
            onSubmit={() => submitQuestion()}
            textareaRef={inputRef}
            value={input}
          />
        </div>
      ) : null}
      <Button
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide portfolio AI assistant" : "Open portfolio AI assistant"}
        className="min-h-12 shadow-lg"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        )}
        <span>{isOpen ? "Close" : "Ask AI"}</span>
      </Button>
    </aside>
  );
}
