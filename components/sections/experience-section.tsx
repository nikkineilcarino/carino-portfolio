import { experienceItems } from "@/constants/experience";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { ExperienceTimeline } from "@/components/shared/experience-timeline";

export function ExperienceSection() {
  return (
    <SectionContainer aria-labelledby="experience-title" id="experience">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader
          description="Internship experience across quality assurance, development, prompt engineering, and Agile collaboration."
          id="experience-title"
          title="Experience"
        />
        <ExperienceTimeline items={experienceItems} />
      </div>
    </SectionContainer>
  );
}
