import type { ExperienceItem } from "@/types";
import { TimelineItem } from "@/components/shared/timeline-item";
import { cn } from "@/lib/utils";

type ExperienceTimelineProps = {
  items: ExperienceItem[];
  className?: string;
};

export function ExperienceTimeline({ items, className }: ExperienceTimelineProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {items.map((item) => (
        <TimelineItem
          items={item.responsibilities}
          key={`${item.company}-${item.year}`}
          meta={item.year}
          note={item.confidentialityNote}
          subtitle={item.company}
          title={item.role}
        />
      ))}
    </div>
  );
}
