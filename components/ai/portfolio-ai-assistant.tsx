"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";
import { PortfolioAiInput } from "@/components/ai/portfolio-ai-input";
import {
  PortfolioAiMessage,
  type PortfolioAiMessageRole,
} from "@/components/ai/portfolio-ai-message";
import { Button } from "@/components/ui/button";

type PortfolioAiResponse = {
  answer?: unknown;
  mode?: unknown;
};

type PortfolioUiMessage = {
  id: string;
  role: PortfolioAiMessageRole;
  content: string;
};

const INITIAL_MESSAGE: PortfolioUiMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content:
    "Hi, I can answer questions about Nikki's portfolio, CV, skills, projects, and contact details.",
};

const MIN_THINKING_DURATION_MS = 350;

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getSafeAnswer(payload: PortfolioAiResponse, fallback: string) {
  return typeof payload.answer === "string" && payload.answer.trim()
    ? payload.answer.trim()
    : fallback;
}

export function PortfolioAiAssistant() {
  const panelId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
  ): PortfolioUiMessage => {
    messageCounterRef.current += 1;

    return {
      id: `${role}-${messageCounterRef.current}`,
      role,
      content,
    };
  };

  const handleSubmit = async () => {
    const question = input.trim();

    if (!question) {
      setInputError("Type a question first.");
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
      const startedAt = Date.now();
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
      const answer = getSafeAnswer(
        payload,
        "I could not answer that right now. Please try again in a moment.",
      );
      const elapsed = Date.now() - startedAt;

      if (elapsed < MIN_THINKING_DURATION_MS) {
        await wait(MIN_THINKING_DURATION_MS - elapsed);
      }

      setMessages((current) => [...current, createMessage("assistant", answer)]);
    } catch {
      await wait(MIN_THINKING_DURATION_MS);
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          "I could not answer that right now. Please try again in a moment.",
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside
      aria-label="Portfolio AI assistant"
      className="fixed bottom-5 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:right-6"
    >
      {isOpen ? (
        <div
          className="w-[calc(100vw-2rem)] max-w-[24rem] overflow-hidden rounded-md border border-[#D4D4D8] bg-[#FAFAFA] shadow-2xl"
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
                  Nikki Neil P. Carino
                </p>
              </div>
            </div>
            <Button
              aria-label="Close portfolio AI assistant"
              className="min-h-9 min-w-9 px-2"
              onClick={() => setIsOpen(false)}
              size="sm"
              variant="ghost"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[min(28rem,62vh)] overflow-y-auto px-3 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <PortfolioAiMessage
                  content={message.content}
                  key={message.id}
                  role={message.role}
                />
              ))}
              {isLoading ? (
                <div aria-live="polite" className="flex justify-start gap-2">
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
            onSubmit={handleSubmit}
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
