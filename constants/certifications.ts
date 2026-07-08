import type { CertificationItem } from "@/types";

const unavailableCertificateImage = {
  status: "not-available" as const,
  note: "No certificate image has been provided yet.",
};

const unavailableCertificateLink = {
  label: "Certificate link",
  status: "not-available" as const,
  note: "Do not add certificate links unless provided.",
};

export const certifications: CertificationItem[] = [
  {
    title: "IBM: Explore Emerging Tech",
    year: "2026",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "Come Vibe With Me: Future-Proofing the Thomasian Developer",
    year: "2026",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "Purple Pill: Merging Offense and Defense for Total Awareness",
    year: "2026",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "Sprint Like a Tiger: Agile Fundamentals",
    year: "2026",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "HP LIFE: Effective Leadership Course",
    year: "2025",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "Code Red: Unraveling the Frontlines of Network Security",
    year: "2024",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "IDEA: Improving Design and Enhancing Abilities",
    year: "2023",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
  {
    title: "Fundamentals 2023 JavaScript Workshop CICS",
    year: "2023",
    image: unavailableCertificateImage,
    link: unavailableCertificateLink,
  },
];
