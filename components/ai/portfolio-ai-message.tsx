"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe2,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { PortfolioAiCopyButton } from "@/components/ai/portfolio-ai-copy-button";
import { PortfolioAiMarkdown } from "@/components/ai/portfolio-ai-markdown";
import type {
  AssistantMessage,
  PortfolioAiFile,
  PortfolioAiLink,
  PortfolioAiProject,
} from "@/lib/ai/portfolio-response";
import { cn } from "@/lib/utils";

export type PortfolioAiMessageRole = "assistant" | "user";

type PortfolioAiMessageProps = {
  role: PortfolioAiMessageRole;
  content: string;
  message?: AssistantMessage;
  showCopy?: boolean;
};

type ResumeFileState = "checking" | "available" | "missing";

function isApprovedRelativeFileUrl(url: string) {
  return url === "/resume/Nikki_Neil_Carino_CV.pdf";
}

function isSafeLinkHref(href: string) {
  try {
    const url = new URL(href);
    return ["https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getLinkIcon(link: PortfolioAiLink) {
  if (link.kind === "email") {
    return Mail;
  }

  if (link.kind === "phone") {
    return Phone;
  }

  return Globe2;
}

function getLinkKindLabel(link: PortfolioAiLink) {
  if (link.kind === "email") {
    return "Email";
  }

  if (link.kind === "phone") {
    return "Phone";
  }

  return "Website";
}

function FileMessage({ file, message }: { file: PortfolioAiFile; message: string }) {
  const isApprovedFile = isApprovedRelativeFileUrl(file.url);
  const [fileState, setFileState] = useState<ResumeFileState>(
    isApprovedFile ? "checking" : "missing",
  );

  useEffect(() => {
    if (!isApprovedFile) {
      return;
    }

    let isMounted = true;

    fetch(file.url, { method: "HEAD" })
      .then((response) => {
        if (isMounted) {
          setFileState(response.ok ? "available" : "missing");
        }
      })
      .catch(() => {
        if (isMounted) {
          setFileState("missing");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file.url, isApprovedFile]);

  return (
    <div className="space-y-3.5">
      <PortfolioAiMarkdown>{message}</PortfolioAiMarkdown>
      <div className="flex items-center gap-3 rounded-md bg-[#F4F4F5] p-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-[#0F766E] shadow-sm">
          <FileText aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#18181B]">Nikki Neil Cariño</p>
          <p className="mt-0.5 text-xs text-[#71717A]">
            PDF resume
            {fileState === "checking" ? " · Checking availability" : ""}
            {fileState === "available" ? " · Available" : ""}
          </p>
        </div>
      </div>
      {isApprovedFile ? (
        <div className="flex flex-wrap gap-2">
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0F766E] bg-white px-3 py-2 text-sm font-semibold text-[#0F766E] underline-offset-4 transition-colors hover:bg-[#F0FDFA] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            href={file.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FileText aria-hidden="true" className="h-4 w-4" />
            <span>View Resume</span>
          </a>
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0F766E] bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white underline-offset-4 transition-colors hover:bg-[#115E59] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            download={file.name}
            href={file.url}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            <span>Download Resume</span>
          </a>
        </div>
      ) : null}
      {fileState === "missing" ? (
        <p className="text-xs leading-5 text-[#B91C1C]" role="alert">
          The resume file is currently unavailable. Please contact me by email
          and I can provide it directly.
        </p>
      ) : null}
    </div>
  );
}

function LinksMessage({
  links,
  message,
}: {
  links: PortfolioAiLink[];
  message: string;
}) {
  return (
    <div className="space-y-3.5">
      <PortfolioAiMarkdown>{message}</PortfolioAiMarkdown>
      <div className="divide-y divide-[#E4E4E7] border-y border-[#E4E4E7]">
        {links.filter((link) => isSafeLinkHref(link.href)).map((link) => {
          const Icon = getLinkIcon(link);
          const isExternal = link.kind === "external";

          return (
            <a
              className="group flex min-h-14 min-w-0 items-center gap-2.5 px-1 py-2 text-[#0F172A] transition-colors hover:bg-[#F0FDFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              href={link.href}
              key={`${link.kind}-${link.href}`}
              rel={isExternal ? "noopener noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-[#0F766E] shadow-sm">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.6875rem] font-semibold uppercase text-[#71717A]">
                  {getLinkKindLabel(link)}
                </span>
                <span className="mt-0.5 block break-all text-xs font-medium underline-offset-4 group-hover:text-[#0F766E] group-hover:underline">
                  {link.label}
                </span>
              </span>
              {isExternal ? (
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ProjectMessage({
  message,
  project,
}: {
  message: string;
  project: PortfolioAiProject;
}) {
  return (
    <div className="space-y-3.5">
      <PortfolioAiMarkdown>{message}</PortfolioAiMarkdown>
      <div className="space-y-3 border-t border-[#E4E4E7] pt-3.5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#0F766E] shadow-sm">
            <FolderKanban aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-[#18181B]">
              {project.name}
            </p>
            <p className="mt-1 break-words text-sm leading-6 text-[#3F3F46] [overflow-wrap:anywhere]">
            {project.summary}
            </p>
          </div>
        </div>
        {project.technologies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" aria-label="Project technologies">
            {project.technologies.map((technology) => (
              <span
                className="max-w-full break-words rounded-md border border-[#BAE6FD] bg-[#F0F9FF] px-2 py-1 text-xs font-medium text-[#075985] [overflow-wrap:anywhere]"
                key={technology}
              >
                {technology}
              </span>
            ))}
          </div>
        ) : null}
        {project.url && isSafeLinkHref(project.url) ? (
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-sm font-medium text-[#0F172A] underline-offset-4 hover:text-[#0F766E] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            href={project.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Globe2 aria-hidden="true" className="h-4 w-4" />
            <span>Open project link</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

function AssistantContent({
  content,
  message,
}: {
  content: string;
  message?: AssistantMessage;
}) {
  if (!message) {
    return <PortfolioAiMarkdown>{content}</PortfolioAiMarkdown>;
  }

  if (message.type === "file") {
    return <FileMessage file={message.file} message={message.message} />;
  }

  if (message.type === "links") {
    return <LinksMessage links={message.links} message={message.message} />;
  }

  if (message.type === "project") {
    return <ProjectMessage message={message.message} project={message.project} />;
  }

  return <PortfolioAiMarkdown>{message.message}</PortfolioAiMarkdown>;
}

export function PortfolioAiMessage({
  role,
  content,
  message,
  showCopy = false,
}: PortfolioAiMessageProps) {
  const isAssistant = role === "assistant";
  const isStructuredAssistantMessage =
    isAssistant && message && message.type !== "text";

  return (
    <div
      data-message-role={role}
      className={cn(
        "flex w-full gap-2.5",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#CCFBF1] text-[#0F766E]">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </span>
      ) : null}
      <div
        data-message-type={isAssistant ? (message?.type ?? "text") : "user"}
        className={cn(
          "min-w-0 text-sm leading-6",
          isStructuredAssistantMessage
            ? "flex-1 rounded-md border border-[#E4E4E7] bg-white px-3.5 py-3 text-[#27272A] shadow-sm"
            : isAssistant
              ? "flex-1 px-1 py-1 text-[#27272A]"
              : "max-w-[min(82%,28rem)] rounded-md bg-[#0F766E] px-3.5 py-2.5 text-white shadow-sm",
        )}
      >
        {isAssistant ? (
          <>
            <AssistantContent content={content} message={message} />
            {showCopy && (!message || message.type === "text") && content.trim() ? (
              <div className="mt-1 flex justify-end">
                <PortfolioAiCopyButton kind="answer" text={content} />
              </div>
            ) : null}
          </>
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
      </div>
    </div>
  );
}
