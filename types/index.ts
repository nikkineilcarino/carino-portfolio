export type NavigationItem = {
  label: string;
  href: string;
  isExternal?: boolean;
  isResume?: boolean;
};

export type ActionLink = {
  label: string;
  href?: string;
  status: "available" | "todo" | "not-available";
  note?: string;
};

export type ImageStatus = {
  status: "available" | "todo" | "not-available" | "confidential";
  note: string;
  targetPath?: string;
  publicPath?: string;
  altText?: string;
};

export type SkillCategory = {
  title: string;
  skills: string[];
};

export type ExperienceItem = {
  company: string;
  role: string;
  year: string;
  responsibilities: string[];
  confidentialityNote?: string;
};

export type ProjectItem = {
  title: string;
  year: string;
  role: string;
  type: string;
  technologies: string[];
  description: string;
  screenshot: ImageStatus;
  liveDemo: ActionLink;
  github: ActionLink;
  confidentialityNote?: string;
  clientNote?: string;
};

export type EducationItem = {
  school: string;
  degree: string;
  years: string;
  relevantCoursework: string[];
};

export type LeadershipItem = {
  organization: string;
  role: string;
  years: string;
};

export type CertificationItem = {
  title: string;
  year: string;
  image: ImageStatus;
  link: ActionLink;
};

export type ProfileAsset = {
  targetPath: string;
  publicPath: string;
  altText: string;
};

export type ResumeAsset = {
  targetPath: string;
  publicPath: string;
};
