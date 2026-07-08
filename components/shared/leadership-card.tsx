import type { LeadershipItem } from "@/types";
import { cn } from "@/lib/utils";

type LeadershipCardProps = {
  item: LeadershipItem;
  className?: string;
};

export function LeadershipCard({ item, className }: LeadershipCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-[#E4E4E7] bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-md",
        className,
      )}
    >
      <p className="text-sm font-medium text-[#B45309]">{item.years}</p>
      <h3 className="mt-2 text-lg font-semibold text-[#18181B]">
        {item.organization}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#3F3F46]">{item.role}</p>
    </article>
  );
}
