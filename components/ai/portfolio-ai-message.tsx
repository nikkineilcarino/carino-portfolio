"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Download,
  ExternalLink,
  FileText,
  Globe2,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
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
    <div className="space-y-3">
      <p className="whitespace-pre-wrap break-words">{message}</p>
      <div className="flex flex-wrap gap-2">
        <a
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0F766E] bg-white px-3 py-2 text-sm font-semibold text-[#0F766E] underline-offset-4 transition-colors hover:bg-[#F0FDFA] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          href={isApprovedFile ? file.url : "#"}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FileText aria-hidden="true" className="h-4 w-4" />
          <span>View Resume</span>
        </a>
        <a
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#0F766E] bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white underline-offset-4 transition-colors hover:bg-[#115E59] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          download={file.name}
          href={isApprovedFile ? file.url : "#"}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          <span>Download Resume</span>
        </a>
      </div>
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
    <div className="space-y-3">
      <p className="whitespace-pre-wrap break-words">{message}</p>
      <div className="flex flex-col gap-2">
        {links.filter((link) => isSafeLinkHref(link.href)).map((link) => {
          const Icon = getLinkIcon(link);
          const isExternal = link.kind === "external";

          return (
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#D4D4D8] bg-white px-3 py-2 text-sm font-medium text-[#0F172A] underline-offset-4 transition-colors hover:border-[#0F766E] hover:text-[#0F766E] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              href={link.href}
              key={`${link.kind}-${link.href}`}
              rel={isExternal ? "noopener noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="break-all">{link.label}</span>
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
    <div className="space-y-3">
      <p className="whitespace-pre-wrap break-words">{message}</p>
      <div className="space-y-2 border-t border-[#E4E4E7] pt-3">
        <div>
          <p className="text-sm font-semibold text-[#18181B]">{project.name}</p>
          <p className="mt-1 text-sm leading-6 text-[#3F3F46]">
            {project.summary}
          </p>
        </div>
        {project.technologies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" aria-label="Project technologies">
            {project.technologies.map((technology) => (
              <span
                className="rounded-md bg-[#E0F2FE] px-2 py-1 text-xs font-medium text-[#075985]"
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
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
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

  return <p className="whitespace-pre-wrap break-words">{message.message}</p>;
}

export function PortfolioAiMessage({
  role,
  content,
  message,
}: PortfolioAiMessageProps) {
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
      <div
        className={cn(
          "max-w-[82%] rounded-md px-3 py-2 text-sm leading-6",
          isAssistant
            ? "border border-[#E4E4E7] bg-white text-[#27272A]"
            : "bg-[#0F766E] text-white",
        )}
      >
        {isAssistant ? (
          <AssistantContent content={content} message={message} />
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
      </div>
      {!isAssistant ? (
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E0E7FF] text-[#3730A3]">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}
