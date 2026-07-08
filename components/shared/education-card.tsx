import type { EducationItem } from "@/types";
import { cn } from "@/lib/utils";

type EducationCardProps = {
  item: EducationItem;
  className?: string;
};

export function EducationCard({ item, className }: EducationCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-[#E4E4E7] bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-md md:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#18181B]">{item.school}</h3>
          <p className="mt-1 text-sm font-medium text-[#3F3F46]">{item.degree}</p>
        </div>
        <p className="text-sm font-medium text-[#52525B]">{item.years}</p>
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold text-[#18181B]">Relevant coursework</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.relevantCoursework.map((course) => (
            <span
              className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-xs font-medium text-[#3F3F46]"
              key={course}
            >
              {course}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
