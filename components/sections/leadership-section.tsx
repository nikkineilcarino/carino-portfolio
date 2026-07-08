import { leadershipItems } from "@/constants/leadership";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { LeadershipCard } from "@/components/shared/leadership-card";

export function LeadershipSection() {
  return (
    <SectionContainer aria-labelledby="leadership-title" id="leadership">
      <SectionHeader
        description="Student leadership and academic organization involvement."
        id="leadership-title"
        title="Leadership"
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {leadershipItems.map((item) => (
          <LeadershipCard
            item={item}
            key={`${item.organization}-${item.years}`}
          />
        ))}
      </div>
    </SectionContainer>
  );
}
