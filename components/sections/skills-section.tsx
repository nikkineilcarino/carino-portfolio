import { skillCategories } from "@/constants/skills";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { SkillCard } from "@/components/shared/skill-card";

export function SkillsSection() {
  return (
    <SectionContainer
      aria-labelledby="skills-title"
      className="bg-[#F4F4F5]"
      id="skills"
    >
      <SectionHeader
        description="A focused toolkit for building, testing, documenting, and improving practical software systems."
        id="skills-title"
        title="Skills"
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillCategories.map((category) => (
          <SkillCard category={category} key={category.title} />
        ))}
      </div>
    </SectionContainer>
  );
}
