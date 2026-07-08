import type { SkillCategory } from "@/types";
import { SkillBadge } from "@/components/shared/skill-badge";
import { cn } from "@/lib/utils";

type SkillCardProps = {
  category: SkillCategory;
  className?: string;
};

export function SkillCard({ category, className }: SkillCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-[#E4E4E7] bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-md",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-[#18181B]">{category.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {category.skills.map((skill) => (
          <SkillBadge key={skill}>{skill}</SkillBadge>
        ))}
      </div>
    </article>
  );
}
