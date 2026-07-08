import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  align = "left",
  id,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold text-[#0F766E]">{eyebrow}</p>
      ) : null}
      <h2
        className="text-[1.75rem] font-semibold leading-tight text-[#18181B] md:text-4xl"
        id={id}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-[#52525B]">{description}</p>
      ) : null}
    </header>
  );
}
