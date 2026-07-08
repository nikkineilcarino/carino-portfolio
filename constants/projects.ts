import type { ProjectItem } from "@/types";

const unavailableLiveDemo = {
  label: "Live demo",
  status: "todo" as const,
  note: "Not available unless approved.",
};

const unavailableGithub = {
  label: "GitHub",
  status: "todo" as const,
  note: "Not available unless approved.",
};

export const projects: ProjectItem[] = [
  {
    title: "Microgenesis Central Hub",
    year: "2026",
    role: "Software Developer Intern",
    type: "Full-stack enterprise portal",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Django REST Framework",
      "PostgreSQL",
    ],
    description:
      "Contributed to the development of a full-stack enterprise portal using Next.js, React, TypeScript, Tailwind CSS, Django REST Framework, and PostgreSQL for user management, marketplace operations, notifications, and AI-assisted workflows.",
    screenshot: {
      status: "confidential",
      note: "No screenshots or proof are available due to company ownership and confidentiality unless explicitly provided and approved for portfolio use.",
    },
    liveDemo: unavailableLiveDemo,
    github: unavailableGithub,
    confidentialityNote:
      "Screenshots are not shown due to company ownership and confidentiality.",
  },
  {
    title: "OneOps",
    year: "2026",
    role: "QA Intern and Software Developer Intern",
    type: "Enterprise web application",
    technologies: ["Python", "TypeScript"],
    description:
      "Developed an enterprise web application using Python and TypeScript for product management, replacements, monthly billing, manpower costing, and software quality assurance.",
    screenshot: {
      status: "confidential",
      note: "Screenshots are not shown due to company ownership and confidentiality.",
    },
    liveDemo: unavailableLiveDemo,
    github: unavailableGithub,
    confidentialityNote:
      "Screenshots are not shown due to company ownership and confidentiality.",
  },
  {
    title: "BTr HCM",
    year: "2026",
    role: "QA Intern and Software Developer Intern",
    type: "Human Capital Management web application",
    technologies: ["Python", "TypeScript"],
    description:
      "Contributed to the development and quality assurance of a Human Capital Management web application for the Bureau of the Treasury using Python and TypeScript.",
    screenshot: {
      status: "confidential",
      note: "Screenshots are not shown due to company ownership and confidentiality.",
    },
    liveDemo: unavailableLiveDemo,
    github: unavailableGithub,
    confidentialityNote:
      "Screenshots are not shown due to company ownership and confidentiality.",
  },
  {
    title: "RecycLens",
    year: "2025–2026",
    role: "Project Manager and Mobile Developer",
    type: "Capstone Project / AI-powered educational Android application",
    technologies: [
      "Kotlin",
      "Python",
      "Firebase",
      "Google Colab",
      "Teachable Machine",
      "Machine Learning",
      "Image Recognition",
    ],
    description:
      "Led project planning, task management, team coordination, and project delivery while developing a mobile application that promotes proper waste segregation among children through machine learning and image recognition.",
    screenshot: {
      status: "todo",
      note: "Add screenshot only if an approved RecycLens asset is provided.",
      altText: "Screenshot of the RecycLens mobile application",
    },
    liveDemo: unavailableLiveDemo,
    github: unavailableGithub,
  },
  {
    title: "Mirror Your World",
    year: "2024–2025",
    role: "Full-Stack Developer",
    type: "Business management web application",
    technologies: ["PHP", "MySQL", "PHPMailer", "FPDF/TCPDF"],
    description:
      "Developed a business management web application featuring consultation booking, appointment scheduling, review management, email notifications, invoice generation, and an administrative dashboard.",
    screenshot: {
      status: "todo",
      note: "Screenshots are not included unless approved for portfolio use.",
      altText: "Screenshot of the Mirror Your World booking system",
    },
    liveDemo: unavailableLiveDemo,
    github: unavailableGithub,
    clientNote:
      "Client project. Screenshots are not included unless approved for portfolio use.",
  },
];
