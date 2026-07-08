import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ScrollIndicatorProps = {
  href: string;
  label: string;
  className?: string;
};

export function ScrollIndicator({ href, label, className }: ScrollIndicatorProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-4 py-2 text-sm font-medium text-[#3F3F46] shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]",
        className,
      )}
      href={href}
    >
      <span>{label}</span>
      <ArrowDown aria-hidden="true" className="h-4 w-4" />
    </a>
  );
}
