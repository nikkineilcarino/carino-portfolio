import { portfolioProfile, resumeFile } from "@/lib/ai/portfolio-profile";
import { PORTFOLIO_AI_LIMITS } from "@/lib/ai/portfolio-limits";

export type PortfolioAiLink = {
  label: string;
  href: string;
  kind: "email" | "phone" | "external";
};

export type PortfolioAiFile = {
  name: typeof resumeFile.name;
  url: typeof resumeFile.url;
  mimeType: typeof resumeFile.mimeType;
};

export type PortfolioAiProject = {
  name: string;
  summary: string;
  technologies: string[];
  url?: string;
};

export type AssistantMessage =
  | {
      type: "text";
      message: string;
    }
  | {
      type: "file";
      message: string;
      file: PortfolioAiFile;
    }
  | {
      type: "links";
      message: string;
      links: PortfolioAiLink[];
    }
  | {
      type: "project";
      message: string;
      project: PortfolioAiProject;
    };

export type PortfolioAiMode =
  | "local_portfolio_answer"
  | "ai"
  | "safe_fallback"
  | "validation_error"
  | "rate_limited";

export type PortfolioAiResponsePayload = {
  answer: string;
  message: AssistantMessage;
  mode: PortfolioAiMode;
};

const SAFE_LINK_PROTOCOLS = new Set(["https:", "mailto:", "tel:"]);

export function createTextMessage(message: string): AssistantMessage {
  return {
    type: "text",
    message,
  };
}

export function createResumeMessage(): AssistantMessage {
  return {
    type: "file",
    message: "Here is my resume. You can view or download it below.",
    file: {
      name: resumeFile.name,
      url: resumeFile.url,
      mimeType: resumeFile.mimeType,
    },
  };
}

export function createContactMessage(): AssistantMessage {
  return {
    type: "links",
    message: "You can reach me through email, phone, GitHub, or my portfolio links below.",
    links: [
      {
        label: portfolioProfile.contact.email,
        href: `mailto:${portfolioProfile.contact.email}`,
        kind: "email",
      },
      {
        label: portfolioProfile.contact.phoneDisplay,
        href: `tel:${portfolioProfile.contact.phoneHref}`,
        kind: "phone",
      },
      {
        label: "github.com/nikkineilcarino",
        href: portfolioProfile.contact.github,
        kind: "external",
      },
      {
        label: "carino-portfolio.vercel.app",
        href: portfolioProfile.contact.portfolio,
        kind: "external",
      },
    ],
  };
}

export function createProjectMessage(project: PortfolioAiProject): AssistantMessage {
  return {
    type: "project",
    message: `${project.name} is one of my approved portfolio projects.`,
    project,
  };
}

export function getMessageText(message: AssistantMessage): string {
  return message.message;
}

export function createResponsePayload(
  message: AssistantMessage,
  mode: PortfolioAiMode,
): PortfolioAiResponsePayload {
  return {
    answer: getMessageText(message),
    message,
    mode,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isSafeLink(link: unknown): link is PortfolioAiLink {
  if (!isObject(link)) {
    return false;
  }

  if (
    typeof link.label !== "string" ||
    typeof link.href !== "string" ||
    !link.label.trim() ||
    link.label.length > PORTFOLIO_AI_LIMITS.linkLabelCharacters ||
    !["email", "phone", "external"].includes(String(link.kind))
  ) {
    return false;
  }

  try {
    const url = new URL(link.href);

    if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) {
      return false;
    }

    return (
      (link.kind === "email" && url.protocol === "mailto:") ||
      (link.kind === "phone" && url.protocol === "tel:") ||
      (link.kind === "external" && url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

function isApprovedResumeFile(file: unknown): file is PortfolioAiFile {
  return (
    isObject(file) &&
    file.name === resumeFile.name &&
    file.url === resumeFile.url &&
    file.mimeType === resumeFile.mimeType
  );
}

function validateProject(project: unknown): PortfolioAiProject | null {
  if (!isObject(project)) {
    return null;
  }

  if (
    typeof project.name !== "string" ||
    typeof project.summary !== "string" ||
    !project.name.trim() ||
    project.name.length > PORTFOLIO_AI_LIMITS.projectNameCharacters ||
    !project.summary.trim() ||
    project.summary.length > PORTFOLIO_AI_LIMITS.projectSummaryCharacters ||
    !Array.isArray(project.technologies) ||
    project.technologies.length > PORTFOLIO_AI_LIMITS.projectTechnologies
  ) {
    return null;
  }

  const technologies = project.technologies.filter(
    (technology): technology is string =>
      typeof technology === "string" &&
      Boolean(technology.trim()) &&
      technology.length <= PORTFOLIO_AI_LIMITS.technologyCharacters,
  );

  if (technologies.length !== project.technologies.length) {
    return null;
  }

  if (typeof project.url === "string") {
    try {
      const url = new URL(project.url);

      if (url.protocol !== "https:") {
        return null;
      }
    } catch {
      return null;
    }
  }

  return {
    name: project.name.trim(),
    summary: project.summary.trim(),
    technologies: technologies.map((technology) => technology.trim()),
    url: typeof project.url === "string" ? project.url : undefined,
  };
}

export function validateAssistantMessage(value: unknown): AssistantMessage | null {
  if (!isObject(value) || typeof value.type !== "string") {
    return null;
  }

  if (
    typeof value.message !== "string" ||
    value.message.trim().length === 0 ||
    value.message.length > PORTFOLIO_AI_LIMITS.assistantMessageCharacters
  ) {
    return null;
  }

  if (value.type === "text") {
    return createTextMessage(value.message.trim());
  }

  if (value.type === "file") {
    if (!isApprovedResumeFile(value.file)) {
      return null;
    }

    return createResumeMessage();
  }

  if (value.type === "links") {
    if (!Array.isArray(value.links)) {
      return null;
    }

    const links = value.links.filter(isSafeLink);

    if (links.length !== value.links.length || links.length === 0) {
      return null;
    }

    return {
      type: "links",
      message: value.message.trim(),
      links: links.map((link) => ({
        ...link,
        label: link.label.trim(),
      })),
    };
  }

  if (value.type === "project") {
    const project = validateProject(value.project);

    if (!project) {
      return null;
    }

    return {
      type: "project",
      message: value.message.trim(),
      project,
    };
  }

  return null;
}
