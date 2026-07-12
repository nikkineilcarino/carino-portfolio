"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";

type PortfolioAiInputProps = {
  value: string;
  error?: string;
  isLoading: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onStop: () => void;
  onSubmit: () => void;
};

const CHARACTER_COUNT_THRESHOLD = 1000;

export function PortfolioAiInput({
  value,
  error,
  isLoading,
  textareaRef,
  onChange,
  onStop,
  onSubmit,
}: PortfolioAiInputProps) {
  const showCharacterCount = value.length >= CHARACTER_COUNT_THRESHOLD;
  const describedBy = [
    error ? "portfolio-ai-input-error" : "",
    showCharacterCount ? "portfolio-ai-character-count" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <form
      className="border-t border-[#E4E4E7] bg-white px-3 pb-3 pt-2.5"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="portfolio-ai-question">
        Message Nikki AI
      </label>
      <div className="flex min-h-12 items-end gap-1.5 rounded-md border border-[#D4D4D8] bg-[#FAFAFA] p-1 transition-[border-color,box-shadow] duration-150 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#BFDBFE]">
        <textarea
          aria-describedby={describedBy || undefined}
          className="max-h-32 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-2.5 py-2.5 text-sm leading-5 text-[#18181B] outline-none [field-sizing:content] placeholder:text-[#71717A] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          id="portfolio-ai-question"
          maxLength={PORTFOLIO_AI_LIMITS.questionCharacters}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nikki AI"
          ref={textareaRef}
          rows={1}
          value={value}
        />
        {isLoading ? (
          <Button
            aria-label="Stop generating"
            className="mb-0.5 min-h-10 min-w-10 px-2.5"
            onClick={onStop}
            title="Stop generating"
            type="button"
            variant="secondary"
          >
            <Square aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            aria-label="Send message to Nikki AI"
            className="mb-0.5 min-h-10 min-w-10 px-2.5"
            title="Send message"
            type="submit"
          >
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      </div>
      {error || showCharacterCount ? (
        <div className="mt-1.5 flex min-h-5 items-start justify-between gap-3 px-1 text-xs leading-5">
          {error ? (
            <p className="text-[#B91C1C]" id="portfolio-ai-input-error">
              {error}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}
          {showCharacterCount ? (
            <p
              className="shrink-0 tabular-nums text-[#71717A]"
              id="portfolio-ai-character-count"
            >
              {value.length}/{PORTFOLIO_AI_LIMITS.questionCharacters}
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
