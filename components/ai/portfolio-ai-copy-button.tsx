"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

type PortfolioAiCopyButtonProps = {
  className?: string;
  kind: "answer" | "code";
  text: string;
};

async function writeToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for browsers that expose the API but deny the operation.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard access was unavailable.");
  }
}

export function PortfolioAiCopyButton({
  className,
  kind,
  text,
}: PortfolioAiCopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = kind === "answer" ? "answer" : "code";

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    try {
      await writeToClipboard(text);
      setState("copied");
    } catch {
      setState("failed");
    }

    resetTimerRef.current = setTimeout(() => setState("idle"), 2_000);
  };

  const accessibleLabel =
    state === "copied"
      ? `Copied ${label}`
      : state === "failed"
        ? `Could not copy ${label}`
        : `Copy ${label}`;

  return (
    <button
      aria-label={accessibleLabel}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent text-[#52525B] transition-colors hover:border-[#D4D4D8] hover:bg-white hover:text-[#0F766E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]",
        className,
      )}
      data-copy-kind={kind}
      onClick={handleCopy}
      title={accessibleLabel}
      type="button"
    >
      {state === "copied" ? (
        <Check aria-hidden="true" className="h-4 w-4 text-[#15803D]" />
      ) : (
        <Copy aria-hidden="true" className="h-4 w-4" />
      )}
      {state !== "idle" ? (
        <span className="sr-only" role="status">
          {state === "copied"
            ? `${label[0].toUpperCase()}${label.slice(1)} copied.`
            : `Could not copy ${label}.`}
        </span>
      ) : null}
    </button>
  );
}
