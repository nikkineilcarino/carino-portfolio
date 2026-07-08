import { educationItems } from "@/constants/education";
import { EducationCard } from "@/components/shared/education-card";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";

export function EducationSection() {
  return (
    <SectionContainer aria-labelledby="education-title" id="education">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader
          description="Academic foundation in information technology, software engineering, databases, security, AI, web, and mobile development."
          id="education-title"
          title="Education"
        />
        <div className="space-y-4">
          {educationItems.map((item) => (
            <EducationCard item={item} key={`${item.school}-${item.years}`} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
