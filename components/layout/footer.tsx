import type { ActionLink } from "@/types";
import { footerContent } from "@/constants/site";
import { cn } from "@/lib/utils";

type FooterProps = {
  name?: string;
  summary?: string;
  links?: ActionLink[];
  className?: string;
};

export function Footer({
  name = footerContent.name,
  summary = footerContent.summary,
  links = footerContent.links,
  className,
}: FooterProps) {
  return (
    <footer className={cn("border-t border-[#E4E4E7] bg-white px-5 py-8", className)}>
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[#18181B]">{name}</p>
          <p className="mt-2 text-sm leading-6 text-[#52525B]">{summary}</p>
        </div>
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                {link.href ? (
                  <a
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-sm font-medium text-[#3F3F46] hover:text-[#0F766E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ) : (
                  <span className="text-sm text-[#52525B]">{link.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
