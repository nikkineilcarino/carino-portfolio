export type PortfolioIntent =
  | "introduction"
  | "professional_summary"
  | "skills"
  | "expertise"
  | "experience"
  | "education"
  | "projects"
  | "specific_project"
  | "resume"
  | "contact"
  | "career_goals"
  | "why_hire"
  | "qualification"
  | "availability"
  | "safety"
  | "unknown";

const keywordGroups: Array<{
  intent: PortfolioIntent;
  keywords: string[];
}> = [
  {
    intent: "safety",
    keywords: [
      "system prompt",
      "developer message",
      "api key",
      "environment variable",
      "env var",
      "secret",
      "server config",
      "internal path",
      "raw json",
      "ignore previous",
      "ignore your instructions",
      "jailbreak",
    ],
  },
  {
    intent: "resume",
    keywords: [
      "resume",
      "cv",
      "curriculum vitae",
      "download resume",
      "download cv",
      "send resume",
      "send me your resume",
      "show resume",
      "open your resume",
      "where is your resume",
      "qualifications document",
    ],
  },
  {
    intent: "contact",
    keywords: [
      "contact",
      "contact details",
      "email",
      "phone",
      "github",
      "reach you",
      "connect with you",
      "hire you",
    ],
  },
  {
    intent: "specific_project",
    keywords: [
      "recyclens",
      "mirror your world",
      "farmwise",
      "jobbridge",
      "job bridge",
      "microblog",
      "micro blog",
      "oneops",
      "one ops",
      "btr hcm",
      "microgenesis central hub",
      "capstone",
    ],
  },
  {
    intent: "projects",
    keywords: ["projects", "portfolio projects", "project", "worked on", "built"],
  },
  {
    intent: "expertise",
    keywords: [
      "expertise",
      "strongest areas",
      "specialization",
      "specialize",
      "strengths",
      "what do you specialize in",
      "do you know",
      "are you an ai expert",
    ],
  },
  {
    intent: "skills",
    keywords: [
      "skills",
      "technologies",
      "technology",
      "tech stack",
      "programming languages",
      "frameworks",
      "tools",
      "what can you do",
      "react",
      "next.js",
      "laravel",
      "flutter",
      "python",
      "typescript",
    ],
  },
  {
    intent: "experience",
    keywords: [
      "experience",
      "internship",
      "microgenesis",
      "qa",
      "quality assurance",
      "testing",
      "test case",
      "bug",
      "defect",
      "what does he do",
      "what do you do",
    ],
  },
  {
    intent: "education",
    keywords: [
      "education",
      "degree",
      "school",
      "university",
      "ust",
      "course",
      "graduated",
      "graduate",
    ],
  },
  {
    intent: "career_goals",
    keywords: [
      "career goals",
      "position",
      "role",
      "roles",
      "looking for",
      "target roles",
      "opportunities",
    ],
  },
  {
    intent: "why_hire",
    keywords: [
      "why should we hire",
      "why hire",
      "sets you apart",
      "qualified",
      "suitable",
      "are you experienced",
    ],
  },
  {
    intent: "availability",
    keywords: ["available", "availability", "open to work", "can you start"],
  },
  {
    intent: "introduction",
    keywords: [
      "who are you",
      "who is nikki",
      "tell me about yourself",
      "introduce yourself",
      "about you",
    ],
  },
  {
    intent: "professional_summary",
    keywords: ["summary", "background", "profile"],
  },
  {
    intent: "qualification",
    keywords: ["qualification", "qualifications"],
  },
];

function normalizeForIntent(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s.+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectPortfolioIntent(question: string): PortfolioIntent {
  const normalizedQuestion = normalizeForIntent(question);

  for (const group of keywordGroups) {
    if (group.keywords.some((keyword) => normalizedQuestion.includes(keyword))) {
      return group.intent;
    }
  }

  return "unknown";
}

export function normalizePortfolioIntentText(question: string): string {
  return normalizeForIntent(question);
}
