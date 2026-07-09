import { portfolioKnowledge } from "@/lib/ai/portfolio-context";
import { buildMissingConfigurationAnswer } from "@/lib/ai/portfolio-prompt";

type LocalPortfolioAnswer = {
  answer: string;
  mode: "local_portfolio_answer" | "general_unconfigured" | "missing_portfolio_info";
};

const missingPortfolioInfoAnswer =
  "That information is not currently provided in the approved portfolio content.";

function normalizeQuestion(question: string): string {
  return question.toLowerCase();
}

function includesAny(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword));
}

function formatSentenceList(items: string[]): string {
  return items.filter(Boolean).join(" ");
}

function formatCommaList(items: string[]): string {
  return items.filter(Boolean).join(", ");
}

function buildContactAnswer(): string {
  return formatSentenceList([
    `You can contact Nikki by email at ${portfolioKnowledge.contact.email}.`,
    `Phone: ${portfolioKnowledge.contact.phone}.`,
    `GitHub: https://${portfolioKnowledge.contact.github}.`,
    `Resume: ${portfolioKnowledge.resume.publicPath}.`,
  ]);
}

function buildSkillsAnswer(): string {
  const skills = portfolioKnowledge.skills
    .map((category) => `${category.title}: ${formatCommaList(category.skills)}`)
    .join("\n");

  return `Nikki's approved portfolio lists these skill areas:\n${skills}`;
}

function buildProjectsAnswer(): string {
  const projects = portfolioKnowledge.projects
    .map(
      (project) =>
        `- ${project.title} (${project.year}): ${project.role}; ${project.type}; technologies include ${formatCommaList(project.technologies)}.`,
    )
    .join("\n");

  return `Nikki's approved portfolio includes these projects:\n${projects}`;
}

function buildQaExperienceAnswer(): string {
  const qaExperience = portfolioKnowledge.experience
    .map((item) => {
      const qaResponsibilities = item.responsibilities.filter((responsibility) =>
        includesAny(responsibility.toLowerCase(), [
          "testing",
          "test",
          "defect",
          "issue",
          "qa",
        ]),
      );

      return `- ${item.role} at ${item.company} (${item.year}): ${qaResponsibilities.join("; ")}`;
    })
    .join("\n");

  return `Nikki has QA experience from the approved portfolio, including functional testing, regression testing, manual testing, test case work, bug reporting, and defect verification.\n${qaExperience}`;
}

function buildDevelopmentExperienceAnswer(): string {
  const experience = portfolioKnowledge.experience
    .map(
      (item) =>
        `- ${item.role} at ${item.company} (${item.year}): ${item.responsibilities.join("; ")}`,
    )
    .join("\n");

  const projects = portfolioKnowledge.projects
    .map(
      (project) =>
        `- ${project.title}: ${project.role}; technologies include ${formatCommaList(project.technologies)}.`,
    )
    .join("\n");

  return `Nikki's software development background includes internship work and project work.\nExperience:\n${experience}\nProjects:\n${projects}`;
}

function buildAiExperienceAnswer(): string {
  const aiSkills = portfolioKnowledge.skills
    .find((category) => category.title === "Machine Learning and AI")
    ?.skills.join(", ");

  const aiProjects = portfolioKnowledge.projects
    .filter((project) =>
      project.technologies.some((technology) =>
        includesAny(technology.toLowerCase(), [
          "machine learning",
          "image recognition",
          "teachable machine",
          "google colab",
          "roboflow",
        ]),
      ),
    )
    .map((project) => `${project.title}: ${project.description}`)
    .join("\n");

  return formatSentenceList([
    `Yes. Nikki's approved portfolio lists AI and prompt engineering experience, including ${aiSkills}.`,
    aiProjects ? `Relevant project:\n${aiProjects}` : "",
  ]);
}

function buildEducationAnswer(): string {
  return portfolioKnowledge.education
    .map(
      (item) =>
        `${item.degree} at ${item.school} (${item.years}). Relevant coursework includes ${formatCommaList(item.relevantCoursework)}.`,
    )
    .join("\n");
}

function buildCertificationsAnswer(): string {
  const certifications = portfolioKnowledge.certifications
    .map((item) => `- ${item.title} (${item.year})`)
    .join("\n");

  return `Nikki's approved portfolio lists these certifications and professional development items:\n${certifications}`;
}

function buildRecycLensAnswer(): string {
  const project = portfolioKnowledge.projects.find(
    (item) => item.title === "RecycLens",
  );

  if (!project) {
    return missingPortfolioInfoAnswer;
  }

  return `${project.title} is listed as a ${project.type}. Nikki's role was ${project.role}. The approved technologies are ${formatCommaList(project.technologies)}. Summary: ${project.description}`;
}

function buildConfidentialityAnswer(): string {
  return [
    "Some project details are intentionally kept general because of company or client confidentiality.",
    "The portfolio does not show confidential screenshots, private company data, client data, credentials, source code, or internal workflows unless Nikki provides and approves those assets.",
  ].join(" ");
}

function buildResumeAnswer(): string {
  return `Nikki's resume is available at ${portfolioKnowledge.resume.publicPath}. Use the portfolio resume button or open that path directly.`;
}

function buildInterviewAnswer(): string {
  return [
    "Good interview questions for Nikki can focus on:",
    "- How he approaches QA test case design and defect verification.",
    "- How he contributed to software development during internship work.",
    "- How he managed and developed RecycLens.",
    "- How he uses AI-assisted workflows and prompt engineering.",
    "- How he handles confidentiality when documenting company or client projects.",
  ].join("\n");
}

function buildUnavailableLinkAnswer(): string {
  return [
    "The approved portfolio does not currently provide that link or proof.",
    "The assistant should not invent live demos, GitHub links, certificate links, LinkedIn links, screenshots, or metrics.",
  ].join(" ");
}

function looksLikePortfolioQuestion(question: string): boolean {
  return includesAny(question, [
    "nikki",
    "carino",
    "cariño",
    "portfolio",
    "resume",
    "cv",
    "project",
    "skill",
    "experience",
    "education",
    "certification",
    "contact",
    "github",
    "email",
    "phone",
    "qa",
    "software",
    "recyclens",
    "microgenesis",
    "oneops",
    "btr",
    "mirror your world",
  ]);
}

function looksLikeGeneralQuestion(question: string): boolean {
  const hasGeneralPattern = includesAny(question, [
    "best programming language",
    "what is the best",
    "how do i",
    "how can i learn",
    "explain ",
    "define ",
  ]);

  const hasPortfolioAnchor = includesAny(question, [
    "nikki",
    "carino",
    "cariño",
    "portfolio",
    "resume",
    "cv",
    "recyclens",
    "microgenesis",
    "oneops",
    "btr",
    "mirror your world",
  ]);

  return hasGeneralPattern && !hasPortfolioAnchor;
}

export function buildLocalPortfolioAnswer(question: string): LocalPortfolioAnswer {
  const normalizedQuestion = normalizeQuestion(question);

  if (looksLikeGeneralQuestion(normalizedQuestion)) {
    return {
      answer: buildMissingConfigurationAnswer(),
      mode: "general_unconfigured",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "confidential",
      "screenshot",
      "internal",
      "private",
      "source code",
      "credential",
      "client data",
      "company data",
    ])
  ) {
    return {
      answer: buildConfidentialityAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "live demo",
      "linkedin",
      "certificate link",
      "github link",
      "metric",
      "invent",
      "proof",
      "age",
      "address",
      "salary",
      "location",
    ])
  ) {
    return {
      answer: buildUnavailableLinkAnswer(),
      mode: "missing_portfolio_info",
    };
  }

  if (includesAny(normalizedQuestion, ["resume", "cv", "download"])) {
    return {
      answer: buildResumeAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["contact", "email", "phone", "reach"])) {
    return {
      answer: buildContactAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["skill", "technology", "tech stack"])) {
    return {
      answer: buildSkillsAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["recyclens"])) {
    return {
      answer: buildRecycLensAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["project", "worked on", "portfolio"])) {
    return {
      answer: buildProjectsAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "qa",
      "quality assurance",
      "testing",
      "test case",
      "bug",
      "defect",
    ])
  ) {
    return {
      answer: buildQaExperienceAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "software development",
      "developer",
      "development experience",
      "full-stack",
      "programming",
    ])
  ) {
    return {
      answer: buildDevelopmentExperienceAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "ai",
      "prompt",
      "machine learning",
      "openai",
      "codex",
      "claude",
    ])
  ) {
    return {
      answer: buildAiExperienceAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (
    includesAny(normalizedQuestion, [
      "education",
      "degree",
      "school",
      "university",
      "coursework",
    ])
  ) {
    return {
      answer: buildEducationAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["certification", "certificate"])) {
    return {
      answer: buildCertificationsAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (includesAny(normalizedQuestion, ["interview", "ask nikki"])) {
    return {
      answer: buildInterviewAnswer(),
      mode: "local_portfolio_answer",
    };
  }

  if (looksLikePortfolioQuestion(normalizedQuestion)) {
    return {
      answer: missingPortfolioInfoAnswer,
      mode: "missing_portfolio_info",
    };
  }

  return {
    answer: buildMissingConfigurationAnswer(),
    mode: "general_unconfigured",
  };
}
