import { cn } from "@/lib/utils";

type SkillBadgeProps = {
  children: string;
  className?: string;
};

export function SkillBadge({ children, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-sm font-medium text-[#3F3F46] transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:bg-[#F4F4F5]",
        className,
      )}
    >
      {children}
    </span>
  );
}
