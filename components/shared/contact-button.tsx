import type { ComponentType, SVGProps } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ContactButtonProps = {
  href: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  isExternal?: boolean;
  className?: string;
};

export function ContactButton({
  href,
  label,
  icon: Icon,
  isExternal = false,
  className,
}: ContactButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-4 py-2.5 text-[0.9375rem] font-semibold text-[#18181B] shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]",
        className,
      )}
      href={href}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      <span className="min-w-0 break-all text-center">{label}</span>
      {isExternal ? <ExternalLink aria-hidden="true" className="h-4 w-4" /> : null}
    </a>
  );
}
