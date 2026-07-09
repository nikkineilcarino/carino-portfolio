import { Bot, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortfolioAiMessageRole = "assistant" | "user";

type PortfolioAiMessageProps = {
  role: PortfolioAiMessageRole;
  content: string;
};

export function PortfolioAiMessage({ role, content }: PortfolioAiMessageProps) {
  const isAssistant = role === "assistant";
  const Icon = isAssistant ? Bot : UserRound;

  return (
    <div
      className={cn(
        "flex gap-2",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#CCFBF1] text-[#0F766E]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      ) : null}
      <p
        className={cn(
          "max-w-[82%] whitespace-pre-wrap break-words rounded-md px-3 py-2 text-sm leading-6",
          isAssistant
            ? "border border-[#E4E4E7] bg-white text-[#27272A]"
            : "bg-[#0F766E] text-white",
        )}
      >
        {content}
      </p>
      {!isAssistant ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E0E7FF] text-[#3730A3]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}
