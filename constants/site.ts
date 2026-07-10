import type { ActionLink, ProfileAsset, ResumeAsset } from "@/types";

export const siteIdentity = {
  name: "Nikki Neil P. Cariño",
  role: "Information Technology Graduate",
  github: "github.com/nikkineilcarino",
  email: "nikkineil.carino@gmail.com",
  phone: "0949-343-3164",
};

export const resumeAsset: ResumeAsset = {
  targetPath: "public/resume/Nikki_Neil_Carino_CV.pdf",
  publicPath: "/resume/Nikki_Neil_Carino_CV.pdf",
};

export const profileAsset: ProfileAsset = {
  targetPath: "public/images/profile/nikki-neil-carino-profile.jpg",
  publicPath: "/images/profile/nikki-neil-carino-profile.jpg",
  altText: "Portrait photo of Nikki Neil Cariño",
};

export const heroContent = {
  name: siteIdentity.name,
  role: siteIdentity.role,
  descriptor:
    "Software development, quality assurance, AI prompt engineering, and project management.",
  summary:
    "I build practical web and mobile systems, test software carefully, write clean documentation, and use AI-assisted workflows to improve development and QA work.",
  primaryAction: {
    label: "Download Resume",
    href: resumeAsset.publicPath,
    status: "available",
  } satisfies ActionLink,
  secondaryAction: {
    label: "View Projects",
    href: "#projects",
    status: "available",
  } satisfies ActionLink,
};

export const aboutContent = {
  title: "About Me",
  paragraphs: [
    "I am a detail-oriented Information Technology graduate from the University of Santo Tomas with experience in software development, quality assurance, AI prompt engineering, and project management.",
    "My work includes testing enterprise web applications, developing full-stack web and mobile solutions, leading academic software projects, and applying AI-assisted development workflows. I value practical systems, clear documentation, careful testing, and continuous improvement.",
  ],
};

export const contactContent = {
  title: "Contact",
  message:
    "I am open to software development, quality assurance, prompt engineering, and IT-related entry-level opportunities.",
  email: siteIdentity.email,
  phone: siteIdentity.phone,
  github: siteIdentity.github,
  resume: {
    label: "Resume",
    href: resumeAsset.publicPath,
    status: "available",
  } satisfies ActionLink,
};

export const footerContent = {
  name: siteIdentity.name,
  summary:
    "Information Technology graduate focused on software development, quality assurance, AI-assisted workflows, and practical web and mobile systems.",
  links: [
    {
      label: "GitHub",
      href: `https://${siteIdentity.github}`,
      status: "available",
    },
    {
      label: "Email",
      href: `mailto:${siteIdentity.email}`,
      status: "available",
    },
    {
      label: "Resume",
      href: resumeAsset.publicPath,
      status: "available",
    },
  ] satisfies ActionLink[],
};

export const seoContent = {
  title: "Nikki Neil Cariño | Software Engineer, QA Engineer, Prompt Engineer",
  description:
    "Portfolio of Nikki Neil Cariño, an Information Technology graduate with experience in software development, quality assurance, AI prompt engineering, project management, and practical web and mobile application projects.",
  keywords: [
    "Nikki Neil Cariño",
    "Software Engineer",
    "QA Engineer",
    "Prompt Engineer",
    "IT Graduate",
    "React Developer",
    "Laravel Developer",
    "Kotlin Developer",
    "Full-Stack Developer",
    "Portfolio",
  ],
};
