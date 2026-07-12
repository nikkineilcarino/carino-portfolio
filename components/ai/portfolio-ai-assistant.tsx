"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { PortfolioAiInput } from "@/components/ai/portfolio-ai-input";
import {
  PortfolioAiMessage,
  type PortfolioAiMessageRole,
} from "@/components/ai/portfolio-ai-message";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";
import {
  createTextMessage,
  validateAssistantMessage,
  type AssistantMessage,
} from "@/lib/ai/portfolio-response";
import {
  PORTFOLIO_AI_STREAM_MEDIA_TYPE,
  readPortfolioAiStream,
} from "@/lib/ai/portfolio-stream";

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

type RequestNotice = {
  kind: "error" | "stopped";
  message: string;
  question: string;
  retryable: boolean;
};

const INITIAL_ASSISTANT_MESSAGE = createTextMessage(
  "Hi, I'm Nikki AI. What would you like to know?",
);

const INITIAL_MESSAGE: PortfolioUiMessage = {
  id: "initial-assistant-message",
  role: "assistant",
  content: INITIAL_ASSISTANT_MESSAGE.message,
  message: INITIAL_ASSISTANT_MESSAGE,
};

const SUGGESTED_QUESTIONS = [
  {
    icon: BriefcaseBusiness,
    label: "Summarize Nikki's experience",
    question: "Give me a concise summary of your experience.",
  },
  {
    icon: FolderKanban,
    label: "Show key projects",
    question: "What are your key projects?",
  },
  {
    icon: FileText,
    label: "Open the resume",
    question: "Can I download your resume?",
  },
];

const SAFE_CLIENT_FALLBACK = createTextMessage(
  "I can still help with questions about my experience, technical skills, projects, education, resume, and contact details. Try asking me about one of those areas.",
);
const STOPPED_BEFORE_ANSWER = createTextMessage(
  "Generation stopped before an answer was returned.",
);

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

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function PortfolioAiAssistant() {
  const panelId = useId();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageCounterRef = useRef(0);
  const activeRequestRef = useRef<AbortController | null>(null);
  const requestSequenceRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForFirstContent, setIsWaitingForFirstContent] =
    useState(false);
  const [liveStatus, setLiveStatus] = useState("");
  const [requestNotice, setRequestNotice] = useState<RequestNotice | null>(null);
  const [messages, setMessages] = useState<PortfolioUiMessage[]>([
    INITIAL_MESSAGE,
  ]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (isOpen) {
        hasOpenedRef.current = true;
        inputRef.current?.focus();
        return;
      }

      if (hasOpenedRef.current) {
        document
          .querySelector<HTMLButtonElement>("[data-nikki-ai-launcher='true']")
          ?.focus();
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [isOpen, messages, isWaitingForFirstContent, requestNotice]);

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

  useEffect(() => {
    return () => {
      requestSequenceRef.current += 1;
      activeRequestRef.current?.abort();
    };
  }, []);

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

  const appendAssistantMessage = (message: AssistantMessage) => {
    setMessages((current) => [
      ...current,
      createMessage("assistant", message.message, message),
    ]);
  };

  const resetConversation = () => {
    requestSequenceRef.current += 1;
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setMessages([INITIAL_MESSAGE]);
    setInput("");
    setInputError("");
    setIsLoading(false);
    setIsWaitingForFirstContent(false);
    setLiveStatus("Conversation reset.");
    setRequestNotice(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const stopGenerating = () => {
    if (!activeRequestRef.current) {
      return;
    }

    stopRequestedRef.current = true;
    activeRequestRef.current.abort();
  };

  const submitQuestion = async (questionOverride?: string) => {
    if (isLoading) {
      return;
    }

    const question = (questionOverride ?? input).trim();

    if (!question) {
      setInputError("Type a question first.");
      return;
    }

    if (question.length > PORTFOLIO_AI_LIMITS.questionCharacters) {
      setInputError("Please keep your question shorter.");
      return;
    }

    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    const controller = new AbortController();
    activeRequestRef.current = controller;
    stopRequestedRef.current = false;

    setInputError("");
    setInput("");
    setIsLoading(true);
    setIsWaitingForFirstContent(true);
    setLiveStatus("Thinking about your question.");
    setRequestNotice(null);

    const userMessage = createMessage("user", question);
    const history = messages
      .filter((message) => message.id !== INITIAL_MESSAGE.id)
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage]);

    let receivedUsableContent = false;
    let receivedErrorEvent = false;
    let receivedDoneEvent = false;
    let streamedContent = "";
    let streamedMessageId: string | null = null;

    const isCurrentRequest = () => requestSequenceRef.current === requestId;

    const appendTextDelta = (delta: string) => {
      streamedContent += delta;

      if (!streamedMessageId) {
        const streamedMessage = createMessage(
          "assistant",
          streamedContent,
          createTextMessage(streamedContent),
        );
        streamedMessageId = streamedMessage.id;
        setMessages((current) => [...current, streamedMessage]);
        return;
      }

      const messageId = streamedMessageId;
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: streamedContent,
                message: createTextMessage(streamedContent),
              }
            : message,
        ),
      );
    };

    try {
      const response = await fetch("/api/portfolio-ai", {
        method: "POST",
        headers: {
          Accept: PORTFOLIO_AI_STREAM_MEDIA_TYPE,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          history,
        }),
        signal: controller.signal,
      });

      if (!isCurrentRequest()) {
        return;
      }

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

      if (!contentType.includes(PORTFOLIO_AI_STREAM_MEDIA_TYPE)) {
        const payload = (await response.json()) as PortfolioAiResponse;
        const assistantMessage = getSafeAssistantMessage(payload);
        receivedUsableContent = true;
        setIsWaitingForFirstContent(false);
        appendAssistantMessage(assistantMessage);
        setLiveStatus("Answer received.");
        return;
      }

      if (!response.body) {
        throw new Error("The response stream was unavailable.");
      }

      for await (const event of readPortfolioAiStream(response.body)) {
        if (!isCurrentRequest()) {
          return;
        }

        if (event.type === "text_delta") {
          if (!receivedUsableContent) {
            receivedUsableContent = true;
            setIsWaitingForFirstContent(false);
            setLiveStatus("Answer is being generated.");
          }

          appendTextDelta(event.delta);
          continue;
        }

        if (event.type === "message") {
          receivedUsableContent = true;
          setIsWaitingForFirstContent(false);
          appendAssistantMessage(event.message);
          continue;
        }

        if (event.type === "error") {
          receivedErrorEvent = true;
          setIsWaitingForFirstContent(false);

          if (!receivedUsableContent) {
            receivedUsableContent = true;
            appendAssistantMessage(createTextMessage(event.message));
          }

          setRequestNotice({
            kind: "error",
            message: event.message,
            question,
            retryable: event.retryable,
          });
          setLiveStatus("The response could not be completed.");
          continue;
        }

        if (event.type === "done") {
          receivedDoneEvent = true;

          if (!receivedErrorEvent) {
            setLiveStatus("Answer received.");
          }
        }
      }

      if (!receivedDoneEvent) {
        throw new Error("The response stream ended before completion.");
      }
    } catch (error) {
      if (!isCurrentRequest()) {
        return;
      }

      setIsWaitingForFirstContent(false);

      if (isAbortError(error) && stopRequestedRef.current) {
        if (!receivedUsableContent) {
          appendAssistantMessage(STOPPED_BEFORE_ANSWER);
        }

        setRequestNotice({
          kind: "stopped",
          message: receivedUsableContent
            ? "Generation stopped. The partial answer was kept."
            : "Generation stopped before an answer was returned.",
          question,
          retryable: true,
        });
        setLiveStatus("Generation stopped.");
      } else {
        if (!receivedUsableContent) {
          appendAssistantMessage(SAFE_CLIENT_FALLBACK);
        }

        setRequestNotice({
          kind: "error",
          message: "The response could not be completed. Please try again.",
          question,
          retryable: true,
        });
        setLiveStatus("The response could not be completed.");
      }
    } finally {
      if (isCurrentRequest()) {
        activeRequestRef.current = null;
        setIsLoading(false);
        setIsWaitingForFirstContent(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
  };

  return (
    <aside
      aria-label="Nikki AI assistant"
      className="pointer-events-none fixed inset-0 z-[70]"
    >
      {isOpen ? (
        <div
          aria-labelledby={`${panelId}-title`}
          aria-modal="false"
          className="portfolio-ai-panel pointer-events-auto absolute inset-2 flex min-h-0 flex-col overflow-hidden rounded-md border border-[#D4D4D8] bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(44rem,calc(100dvh-3rem))] sm:w-[32rem] lg:w-[34rem]"
          id={panelId}
          role="dialog"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#E4E4E7] bg-white px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0F766E] text-white shadow-sm">
                <Sparkles aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
              </span>
              <div className="min-w-0">
                <p
                  className="truncate text-[0.9375rem] font-semibold text-[#18181B]"
                  id={`${panelId}-title`}
                >
                  Nikki AI
                </p>
                <div
                  aria-label="Nikki AI is ready"
                  className="mt-0.5 flex items-center gap-1.5 text-xs text-[#52525B]"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#16A34A]"
                  />
                  <span>Ready</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                aria-label="Reset portfolio AI conversation"
                className="min-h-9 px-2 text-xs"
                onClick={resetConversation}
                size="sm"
                title="Reset conversation"
                type="button"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Close Nikki AI"
                className="min-h-9 min-w-9 px-2"
                onClick={() => setIsOpen(false)}
                size="sm"
                title="Close Nikki AI"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p aria-live="polite" className="sr-only" role="status">
            {liveStatus}
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAFA] px-4 py-5 sm:px-5">
            <div className="mx-auto flex w-full max-w-[31rem] flex-col gap-4">
              {messages.map((message) => (
                <PortfolioAiMessage
                  content={message.content}
                  key={message.id}
                  message={message.message}
                  role={message.role}
                  showCopy={message.id !== INITIAL_MESSAGE.id}
                />
              ))}
              {messages.length === 1 && !isLoading ? (
                <div
                  aria-label="Suggested questions"
                  className="ml-10 grid gap-1.5"
                >
                  {SUGGESTED_QUESTIONS.map(({ icon: Icon, label, question }) => (
                    <button
                      className="group flex min-h-11 items-center gap-2.5 rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-left text-xs font-medium text-[#3F3F46] shadow-sm transition-[border-color,color,background-color] hover:border-[#99F6E4] hover:bg-[#F0FDFA] hover:text-[#0F766E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                      disabled={isLoading}
                      key={label}
                      onClick={() => submitQuestion(question)}
                      type="button"
                    >
                      <Icon
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-[#71717A] transition-colors group-hover:text-[#0F766E]"
                      />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {isLoading && isWaitingForFirstContent ? (
                <div
                  aria-hidden="true"
                  className="flex justify-start gap-2.5"
                  data-ai-state="thinking"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#CCFBF1] text-[#0F766E]">
                    <Sparkles
                      aria-hidden="true"
                      className="h-4 w-4 animate-pulse motion-reduce:animate-none"
                    />
                  </span>
                  <p className="px-1 py-1 text-sm leading-6 text-[#52525B]">
                    Thinking...
                  </p>
                </div>
              ) : null}
              {requestNotice ? (
                <div
                  className={`ml-10 rounded-md border px-3 py-2 text-sm leading-5 ${
                    requestNotice.kind === "error"
                      ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
                      : "border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]"
                  }`}
                  role={requestNotice.kind === "error" ? "alert" : "status"}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <p>{requestNotice.message}</p>
                  </div>
                  {requestNotice.retryable ? (
                    <Button
                      aria-label="Retry last portfolio AI question"
                      className="mt-2 min-h-9"
                      disabled={isLoading}
                      onClick={() => submitQuestion(requestNotice.question)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <RefreshCw aria-hidden="true" className="h-4 w-4" />
                      <span>Retry</span>
                    </Button>
                  ) : null}
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
            onStop={stopGenerating}
            onSubmit={() => submitQuestion()}
            textareaRef={inputRef}
            value={input}
          />
        </div>
      ) : null}
      {!isOpen ? (
        <Button
          aria-controls={panelId}
          aria-expanded="false"
          aria-label="Open Nikki AI"
          className="portfolio-ai-launcher pointer-events-auto absolute bottom-4 right-4 min-h-12 shadow-lg sm:bottom-6 sm:right-6"
          data-nikki-ai-launcher="true"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          <span>Ask Nikki AI</span>
        </Button>
      ) : null}
    </aside>
  );
}
