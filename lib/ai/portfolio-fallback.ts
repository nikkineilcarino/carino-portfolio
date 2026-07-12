import {
  detectPortfolioIntent,
  normalizePortfolioIntentText,
  type PortfolioIntent,
} from "@/lib/ai/portfolio-intents";
import { portfolioProfile, type PortfolioProjectProfile } from "@/lib/ai/portfolio-profile";
import {
  createContactMessage,
  createProjectMessage,
  createResumeMessage,
  createResponsePayload,
  createTextMessage,
  type AssistantMessage,
  type PortfolioAiResponsePayload,
} from "@/lib/ai/portfolio-response";

type LocalPortfolioAnswer = PortfolioAiResponsePayload & {
  intent: PortfolioIntent;
  isKnownIntent: boolean;
};

function formatList(items: readonly string[]): string {
  return items.filter(Boolean).join(", ");
}

function buildTextResponse(
  message: string,
  intent: PortfolioIntent,
  isKnownIntent = true,
): LocalPortfolioAnswer {
  return {
    ...createResponsePayload(createTextMessage(message), "local_portfolio_answer"),
    intent,
    isKnownIntent,
  };
}

function buildStructuredResponse(
  message: AssistantMessage,
  intent: PortfolioIntent,
): LocalPortfolioAnswer {
  return {
    ...createResponsePayload(message, "local_portfolio_answer"),
    intent,
    isKnownIntent: true,
  };
}

function buildIntroductionAnswer(): string {
  return [
    "I'm Nikki Neil P. Cariño, a recent BS Information Technology graduate from the University of Santo Tomas.",
    "My background combines software development, software quality assurance, prompt engineering, and AI-assisted development. I enjoy building practical applications, testing systems carefully, and continuously improving my technical skills.",
  ].join("\n\n");
}

function buildProfessionalSummaryAnswer(): string {
  return [
    "I work across software development, quality assurance, and AI-assisted workflows. During my internship at Microgenesis Business Systems, I performed functional and regression testing, created test cases, documented defects, supported development using Python and TypeScript, and designed prompts for development and QA tasks.",
    "I also build web and mobile applications using technologies such as React, Laravel, Flutter, Kotlin, PHP, Python, and MySQL.",
  ].join("\n\n");
}

function buildSkillsAnswer(): string {
  return [
    "My main technical skills are in full-stack web development, software testing, backend development, API integration, mobile development, and AI-assisted workflows.",
    `I have hands-on experience with ${formatList([
      ...portfolioProfile.skills.programmingLanguages.slice(0, 6),
      "React",
      "Next.js",
      "Laravel",
      "Flutter",
      "Django",
      "MySQL",
      "PostgreSQL",
      "REST APIs",
      "Git",
      "GitHub",
    ])}.`,
  ].join("\n\n");
}

function buildExpertiseAnswer(normalizedQuestion: string): string {
  if (normalizedQuestion.includes("ai expert")) {
    return [
      "I would describe myself as entry-level with hands-on AI-assisted workflow and prompt-engineering experience, not as an expert-level AI engineer.",
      "I have used tools and workflows such as prompt engineering, OpenAI Codex, Claude, Google Colab, Roboflow, Teachable Machine, YOLOv8, and TensorFlow Lite in internship, documentation, QA, and project contexts.",
    ].join("\n\n");
  }

  if (normalizedQuestion.includes("react")) {
    return [
      "Yes. I have hands-on experience with React and Next.js through web development work, including portfolio and project experience.",
      "I use React as part of a broader full-stack skill set that also includes TypeScript, Laravel, Django, REST APIs, MySQL, PostgreSQL, testing, and Git-based workflows.",
    ].join("\n\n");
  }

  return [
    `My strongest areas are ${formatList(portfolioProfile.strongestAreas)}.`,
    "I have applied these through my internship, academic work, capstone development, and personal projects.",
  ].join("\n\n");
}

function buildExperienceAnswer(): string {
  return [
    `During my internship at ${portfolioProfile.internship.company}, I worked in software quality assurance and development support.`,
    `My work included ${formatList(portfolioProfile.internship.responsibilities.slice(0, 6))}. I also gained experience with Agile sprint planning, issue tracking, and cross-functional collaboration.`,
  ].join("\n\n");
}

function buildEducationAnswer(): string {
  return portfolioProfile.education
    .map(
      (item) =>
        `I studied ${item.program} at ${item.institution} from ${item.period}. I graduated as a recent Information Technology graduate and I am focused on entry-level technology roles where I can continue growing through real project work.`,
    )
    .join("\n\n");
}

function buildProjectsAnswer(): string {
  const projectSummaries = portfolioProfile.projects
    .map((project) => `${project.name}: ${project.summary}`)
    .join("\n");

  return [
    "My portfolio includes academic, capstone, and personal projects across mobile, web, full-stack, and data-visualization work.",
    projectSummaries,
  ].join("\n\n");
}

function getProjectByQuestion(normalizedQuestion: string): PortfolioProjectProfile | null {
  const aliases: Array<[string[], PortfolioProjectProfile["name"]]> = [
    [["recyclens", "capstone"], "RecycLens"],
    [["mirror your world"], "Mirror Your World"],
    [["farmwise"], "FarmWise"],
    [["jobbridge", "job bridge"], "JobBridge"],
    [["microblog", "micro blog"], "Microblog"],
  ];

  for (const [keywords, projectName] of aliases) {
    if (keywords.some((keyword) => normalizedQuestion.includes(keyword))) {
      return (
        portfolioProfile.projects.find((project) => project.name === projectName) ??
        null
      );
    }
  }

  return null;
}

function buildSpecificProjectAnswer(
  normalizedQuestion: string,
): AssistantMessage | null {
  if (
    normalizedQuestion.includes("oneops") ||
    normalizedQuestion.includes("one ops") ||
    normalizedQuestion.includes("btr hcm") ||
    normalizedQuestion.includes("microgenesis central hub")
  ) {
    return createTextMessage(
      [
        "I supported Microgenesis Central Hub, OneOPS, and BTr HCM during my internship at Microgenesis Business Systems.",
        "I did not own or build those projects alone. My contribution was internship-based support across QA, development tasks, prompt engineering, Agile issue tracking, and collaboration with developers, QA personnel, and stakeholders.",
      ].join("\n\n"),
    );
  }

  const project = getProjectByQuestion(normalizedQuestion);

  if (!project) {
    return null;
  }

  const featureSummary = project.features
    .map((feature) => feature.replace(/[.]+$/, ""))
    .join("; ");

  const summary = [
    project.summary,
    featureSummary ? `Key features: ${featureSummary}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return createProjectMessage({
    name: project.name,
    summary,
    technologies: [...project.technologies],
  });
}

function buildCareerGoalsAnswer(): string {
  return [
    "I am interested in entry-level opportunities in software development, full-stack or backend development, software quality assurance, application development, and AI-assisted technology workflows.",
    "I am looking for a role where I can contribute to real projects while continuing to grow under experienced developers and QA professionals.",
  ].join("\n\n");
}

function buildWhyHireAnswer(): string {
  return [
    "I bring a combination of software development, quality assurance, and AI-assisted workflow experience. I do not focus only on building features; I also consider testing, usability, documentation, and software quality.",
    "As a recent IT graduate, I am adaptable, willing to learn, and ready to contribute while continuing to grow under experienced developers and QA professionals.",
  ].join("\n\n");
}

function buildQualificationAnswer(): string {
  return [
    `I recently completed my ${portfolioProfile.identity.degree} at ${portfolioProfile.identity.university}.`,
    "My qualifications are strongest in software development, QA/testing, backend and API work, mobile development, and AI-assisted workflows. For a formal document, you can ask for my resume or CV.",
  ].join("\n\n");
}

function buildConfidentialityAnswer(): string {
  return [
    "Some project details are intentionally kept general because of company or client confidentiality.",
    "I do not share confidential screenshots, private company data, client data, credentials, source code, or internal workflows unless those assets are specifically provided and approved for public portfolio use.",
  ].join(" ");
}

function buildSafetyAnswer(): string {
  return [
    "I cannot share internal instructions, secrets, API keys, system configuration, private implementation details, or hidden chain-of-thought.",
    "I can provide a concise answer or a short summary of the factors behind an answer without exposing private reasoning.",
    "I can still help with my experience, projects, technical skills, education, resume, and contact details.",
  ].join("\n\n");
}

function buildCapabilityLimitsAnswer(): string {
  return [
    "I do not have live web search enabled in this portfolio, so I cannot verify current online information or claim to have browsed a source.",
    "I can still answer general questions from the configured model's built-in knowledge, but time-sensitive details may be outdated. You can also ask about Nikki's portfolio, resume, projects, skills, or contact details.",
  ].join("\n\n");
}

function buildHarmfulRequestAnswer(): string {
  return [
    "I cannot help create malware, steal credentials, bypass authentication, or harm people.",
    "I can help with defensive security, secure coding, threat awareness, incident response planning, or other protective and educational alternatives.",
  ].join("\n\n");
}

function buildUnavailableAnswer(): string {
  return portfolioProfile.unavailableMessage;
}

function isConfidentialQuestion(normalizedQuestion: string): boolean {
  return [
    "confidential",
    "screenshot",
    "internal workflow",
    "private",
    "source code",
    "credential",
    "client data",
    "company data",
  ].some((keyword) => normalizedQuestion.includes(keyword));
}

function isUnavailablePortfolioQuestion(normalizedQuestion: string): boolean {
  return [
    "linkedin",
    "certificate link",
    "live demo",
    "address",
    "age",
    "salary",
    "password",
  ].some((keyword) => normalizedQuestion.includes(keyword));
}

export function buildLocalPortfolioAnswer(question: string): LocalPortfolioAnswer {
  const normalizedQuestion = normalizePortfolioIntentText(question);
  const intent = detectPortfolioIntent(question);

  if (intent === "harmful_request") {
    return buildTextResponse(buildHarmfulRequestAnswer(), intent);
  }

  if (isConfidentialQuestion(normalizedQuestion)) {
    return buildTextResponse(
      buildConfidentialityAnswer(),
      "safety",
    );
  }

  if (isUnavailablePortfolioQuestion(normalizedQuestion)) {
    return buildTextResponse(buildUnavailableAnswer(), "unknown");
  }

  if (intent === "safety") {
    return buildTextResponse(buildSafetyAnswer(), intent);
  }

  if (intent === "capability_limits") {
    return buildTextResponse(buildCapabilityLimitsAnswer(), intent);
  }

  if (intent === "resume") {
    return buildStructuredResponse(createResumeMessage(), intent);
  }

  if (intent === "contact") {
    return buildStructuredResponse(createContactMessage(), intent);
  }

  if (intent === "introduction") {
    return buildTextResponse(buildIntroductionAnswer(), intent);
  }

  if (intent === "professional_summary") {
    return buildTextResponse(buildProfessionalSummaryAnswer(), intent);
  }

  if (intent === "skills") {
    return buildTextResponse(buildSkillsAnswer(), intent);
  }

  if (intent === "expertise") {
    return buildTextResponse(buildExpertiseAnswer(normalizedQuestion), intent);
  }

  if (intent === "experience") {
    return buildTextResponse(buildExperienceAnswer(), intent);
  }

  if (intent === "education") {
    return buildTextResponse(buildEducationAnswer(), intent);
  }

  if (intent === "projects") {
    return buildTextResponse(buildProjectsAnswer(), intent);
  }

  if (intent === "specific_project") {
    const projectMessage = buildSpecificProjectAnswer(normalizedQuestion);

    if (projectMessage) {
      return buildStructuredResponse(projectMessage, intent);
    }
  }

  if (intent === "career_goals" || intent === "availability") {
    return buildTextResponse(buildCareerGoalsAnswer(), intent);
  }

  if (intent === "why_hire") {
    return buildTextResponse(buildWhyHireAnswer(), intent);
  }

  if (intent === "qualification") {
    return buildTextResponse(buildQualificationAnswer(), intent);
  }

  return {
    ...createResponsePayload(
      createTextMessage(portfolioProfile.localFallbackMessage),
      "safe_fallback",
    ),
    intent: "unknown",
    isKnownIntent: false,
  };
}
