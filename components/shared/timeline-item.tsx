import { cn } from "@/lib/utils";

type TimelineItemProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  items?: string[];
  note?: string;
  className?: string;
};

export function TimelineItem({
  title,
  subtitle,
  meta,
  items = [],
  note,
  className,
}: TimelineItemProps) {
  return (
    <article className={cn("relative border-l border-[#E4E4E7] pl-6", className)}>
      <span
        aria-hidden="true"
        className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#0F766E]"
      />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#18181B]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-[#3F3F46]">{subtitle}</p>
          ) : null}
        </div>
        {meta ? (
          <p className="text-sm font-medium text-[#52525B] sm:pl-6">{meta}</p>
        ) : null}
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[#3F3F46]">
          {items.map((item) => (
            <li className="list-disc pl-1 marker:text-[#0F766E]" key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {note ? <p className="mt-4 text-sm leading-6 text-[#52525B]">{note}</p> : null}
    </article>
  );
}
