import { certifications } from "@/constants/certifications";
import { educationItems } from "@/constants/education";
import { experienceItems } from "@/constants/experience";
import { leadershipItems } from "@/constants/leadership";
import { projects } from "@/constants/projects";
import {
  aboutContent,
  contactContent,
  heroContent,
  profileAsset,
  resumeAsset,
  siteIdentity,
} from "@/constants/site";
import { skillCategories } from "@/constants/skills";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LeadershipItem,
  ProjectItem,
  SkillCategory,
} from "@/types";

export type PortfolioIdentity = {
  name: string;
  role: string;
  github: string;
  email: string;
  phone: string;
};

export type PortfolioResumeKnowledge = {
  label: string;
  publicPath: string;
  status: "available" | "todo" | "not-available";
};

export type PortfolioProfileKnowledge = {
  publicPath: string;
  altText: string;
};

export type PortfolioKnowledge = {
  identity: PortfolioIdentity;
  summary: {
    descriptor: string;
    heroSummary: string;
    aboutTitle: string;
    aboutParagraphs: string[];
  };
  resume: PortfolioResumeKnowledge;
  profile: PortfolioProfileKnowledge;
  contact: {
    message: string;
    email: string;
    phone: string;
    github: string;
  };
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  leadership: LeadershipItem[];
  answerBoundaries: string[];
};

export const portfolioKnowledge: PortfolioKnowledge = {
  identity: {
    name: siteIdentity.name,
    role: siteIdentity.role,
    github: siteIdentity.github,
    email: siteIdentity.email,
    phone: siteIdentity.phone,
  },
  summary: {
    descriptor: heroContent.descriptor,
    heroSummary: heroContent.summary,
    aboutTitle: aboutContent.title,
    aboutParagraphs: aboutContent.paragraphs,
  },
  resume: {
    label: contactContent.resume.label,
    publicPath: resumeAsset.publicPath,
    status: contactContent.resume.status,
  },
  profile: {
    publicPath: profileAsset.publicPath,
    altText: profileAsset.altText,
  },
  contact: {
    message: contactContent.message,
    email: contactContent.email,
    phone: contactContent.phone,
    github: contactContent.github,
  },
  skills: skillCategories,
  experience: experienceItems,
  projects,
  education: educationItems,
  certifications,
  leadership: leadershipItems,
  answerBoundaries: [
    "Use approved portfolio facts first.",
    "Do not invent screenshots, live demos, GitHub links, certificates, metrics, achievements, or confidential project details.",
    "If information about Nikki is not present in the portfolio context, say it is not currently provided in the portfolio.",
    "If a question is general and not about Nikki, answer with general AI knowledge and clarify that it is general information.",
    "Present the assistant as a portfolio helper, not as Nikki.",
  ],
};

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "- Not provided";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function formatNamedList<T>(
  items: T[],
  formatter: (item: T) => string,
): string {
  if (items.length === 0) {
    return "- Not provided";
  }

  return items.map(formatter).join("\n");
}

function formatLinkStatus(label: string, status: string, note?: string): string {
  return note ? `${label}: ${status} (${note})` : `${label}: ${status}`;
}

export function formatPortfolioContextForPrompt(
  knowledge: PortfolioKnowledge = portfolioKnowledge,
): string {
  return [
    `Portfolio owner: ${knowledge.identity.name}`,
    `Role: ${knowledge.identity.role}`,
    `Summary: ${knowledge.summary.heroSummary}`,
    `Descriptor: ${knowledge.summary.descriptor}`,
    "",
    "Contact:",
    formatList([
      `Email: ${knowledge.contact.email}`,
      `Phone: ${knowledge.contact.phone}`,
      `GitHub: ${knowledge.contact.github}`,
      `Resume: ${knowledge.resume.publicPath} (${knowledge.resume.status})`,
      knowledge.contact.message,
    ]),
    "",
    "About:",
    formatList(knowledge.summary.aboutParagraphs),
    "",
    "Skills:",
    formatNamedList(
      knowledge.skills,
      (category) => `- ${category.title}: ${category.skills.join(", ")}`,
    ),
    "",
    "Experience:",
    formatNamedList(
      knowledge.experience,
      (item) =>
        [
          `- ${item.role} at ${item.company} (${item.year})`,
          `  Responsibilities: ${item.responsibilities.join("; ")}`,
          item.confidentialityNote
            ? `  Confidentiality note: ${item.confidentialityNote}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n"),
    ),
    "",
    "Projects:",
    formatNamedList(
      knowledge.projects,
      (project) =>
        [
          `- ${project.title} (${project.year})`,
          `  Role: ${project.role}`,
          `  Type: ${project.type}`,
          `  Technologies: ${project.technologies.join(", ")}`,
          `  Description: ${project.description}`,
          `  Screenshot: ${project.screenshot.status} (${project.screenshot.note})`,
          `  ${formatLinkStatus(project.liveDemo.label, project.liveDemo.status, project.liveDemo.note)}`,
          `  ${formatLinkStatus(project.github.label, project.github.status, project.github.note)}`,
          project.confidentialityNote
            ? `  Confidentiality note: ${project.confidentialityNote}`
            : undefined,
          project.clientNote ? `  Client note: ${project.clientNote}` : undefined,
        ]
          .filter(Boolean)
          .join("\n"),
    ),
    "",
    "Education:",
    formatNamedList(
      knowledge.education,
      (item) =>
        `- ${item.degree}, ${item.school} (${item.years}); coursework: ${item.relevantCoursework.join(", ")}`,
    ),
    "",
    "Certifications:",
    formatNamedList(
      knowledge.certifications,
      (item) =>
        `- ${item.title} (${item.year}); image: ${item.image.status}; link: ${item.link.status}`,
    ),
    "",
    "Leadership:",
    formatNamedList(
      knowledge.leadership,
      (item) => `- ${item.role}, ${item.organization} (${item.years})`,
    ),
    "",
    "Answer boundaries:",
    formatList(knowledge.answerBoundaries),
  ].join("\n");
}
