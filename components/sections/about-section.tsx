import { aboutContent } from "@/constants/site";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";

export function AboutSection() {
  return (
    <SectionContainer aria-labelledby="about-title" id="about">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <SectionHeader
          description="A practical background across development, QA, prompt engineering, and project work."
          id="about-title"
          title={aboutContent.title}
        />
        <div className="space-y-5 text-base leading-8 text-[#3F3F46]">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
