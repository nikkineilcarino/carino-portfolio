"use client";

import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { PortfolioAiCopyButton } from "@/components/ai/portfolio-ai-copy-button";
import { cn } from "@/lib/utils";

const SAFE_ABSOLUTE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const ALLOWED_MARKDOWN_ELEMENTS = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

export function isSafeMarkdownUrl(url: string) {
  if (
    !url ||
    url !== url.trim() ||
    /[\u0000-\u001F\u007F]/.test(url) ||
    url.startsWith("//") ||
    url.startsWith("\\")
  ) {
    return false;
  }

  if (
    url.startsWith("#") ||
    url.startsWith("/") ||
    url.startsWith("./") ||
    url.startsWith("../")
  ) {
    return true;
  }

  try {
    return SAFE_ABSOLUTE_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

function safeUrlTransform(url: string) {
  return isSafeMarkdownUrl(url) ? url : "";
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }

  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return getNodeText(props.children);
  }

  return "";
}

function MarkdownLink({ children, href, ...props }: ComponentProps<"a">) {
  if (!href || !isSafeMarkdownUrl(href)) {
    return <span className="break-words">{children}</span>;
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  return (
    <a
      {...props}
      className="break-words font-medium text-[#0F766E] underline decoration-[#99F6E4] underline-offset-4 hover:decoration-[#0F766E] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}

function MarkdownPre({ children, ...props }: ComponentProps<"pre">) {
  const code = getNodeText(children).replace(/\n$/, "");

  return (
    <div className="relative my-3 min-w-0 max-w-full overflow-hidden rounded-md border border-[#27272A] bg-[#18181B] text-[#F4F4F5]">
      <PortfolioAiCopyButton
        className="absolute right-1.5 top-1.5 z-10 border-[#3F3F46] bg-[#27272A] text-[#D4D4D8] hover:border-[#52525B] hover:bg-[#3F3F46] hover:text-white"
        kind="code"
        text={code}
      />
      <pre
        {...props}
        className="max-w-full overflow-x-auto px-3.5 pb-3.5 pt-12 text-xs leading-5 [tab-size:2] [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      >
        {children}
      </pre>
    </div>
  );
}

const markdownComponents: Components = {
  a: MarkdownLink,
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      className="my-3 border-l-2 border-[#5EEAD4] pl-3 text-[#52525B]"
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => (
    <code
      {...props}
      className={cn(
        "break-words rounded bg-[#E4E4E7] px-1.5 py-0.5 font-mono text-[0.8125rem] text-[#18181B]",
        className,
      )}
    >
      {children}
    </code>
  ),
  h1: ({ children, ...props }) => (
    <h1 {...props} className="mt-4 break-words text-lg font-semibold text-[#18181B] first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 {...props} className="mt-4 break-words text-base font-semibold text-[#18181B] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props} className="mt-3 break-words text-sm font-semibold text-[#18181B] first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 {...props} className="mt-3 break-words text-sm font-semibold text-[#27272A] first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 {...props} className="mt-3 break-words text-sm font-medium text-[#27272A] first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 {...props} className="mt-3 break-words text-xs font-semibold text-[#52525B] first:mt-0">
      {children}
    </h6>
  ),
  hr: (props) => <hr {...props} className="my-4 border-[#D4D4D8]" />,
  li: ({ children, ...props }) => (
    <li {...props} className="break-words pl-1 marker:text-[#0F766E]">
      {children}
    </li>
  ),
  ol: ({ children, ...props }) => (
    <ol {...props} className="my-2 list-decimal space-y-1 pl-5">
      {children}
    </ol>
  ),
  p: ({ children, ...props }) => (
    <p {...props} className="my-2 break-words [overflow-wrap:anywhere] first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  pre: MarkdownPre,
  table: ({ children, ...props }) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-md border border-[#D4D4D8]">
      <table {...props} className="w-full min-w-max border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  td: ({ children, ...props }) => (
    <td {...props} className="border-t border-[#E4E4E7] px-3 py-2 align-top">
      {children}
    </td>
  ),
  th: ({ children, ...props }) => (
    <th {...props} className="bg-[#F4F4F5] px-3 py-2 font-semibold text-[#27272A]">
      {children}
    </th>
  ),
  ul: ({ children, ...props }) => (
    <ul {...props} className="my-2 list-disc space-y-1 pl-5">
      {children}
    </ul>
  ),
};

type PortfolioAiMarkdownProps = {
  children: string;
  className?: string;
};

export function PortfolioAiMarkdown({
  children,
  className,
}: PortfolioAiMarkdownProps) {
  return (
    <div className={cn("min-w-0 max-w-full", className)} data-ai-markdown="true">
      <ReactMarkdown
        allowedElements={ALLOWED_MARKDOWN_ELEMENTS}
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        skipHtml
        unwrapDisallowed
        urlTransform={safeUrlTransform}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
