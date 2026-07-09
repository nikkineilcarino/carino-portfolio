"use client";

import { type FormEvent, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";

type PortfolioAiInputProps = {
  value: string;
  error?: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function PortfolioAiInput({
  value,
  error,
  isLoading,
  onChange,
  onSubmit,
}: PortfolioAiInputProps) {
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
    <form className="border-t border-[#E4E4E7] p-3" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="portfolio-ai-question">
        Ask a portfolio question
      </label>
      <div className="flex items-end gap-2">
        <textarea
          aria-describedby={error ? "portfolio-ai-input-error" : undefined}
          className="min-h-11 flex-1 resize-none rounded-md border border-[#D4D4D8] bg-white px-3 py-2.5 text-sm leading-5 text-[#18181B] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#71717A] focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
          disabled={isLoading}
          id="portfolio-ai-question"
          maxLength={1200}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about CV, skills, projects, or contact details"
          rows={2}
          value={value}
        />
        <Button
          aria-label="Send portfolio question"
          className="min-h-11 min-w-11 px-3"
          disabled={isLoading}
          type="submit"
        >
          <SendHorizonal aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-sm leading-5 text-[#B91C1C]" id="portfolio-ai-input-error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
