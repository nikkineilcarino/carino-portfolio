"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import type { NavigationItem } from "@/types";
import { navigationItems } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavbarProps = {
  items?: NavigationItem[];
  brandLabel?: string;
  className?: string;
};

export function Navbar({
  items = navigationItems,
  brandLabel = "Nikki Neil P. Cariño",
  className,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const resumeItem = useMemo(() => items.find((item) => item.isResume), [items]);
  const standardItems = useMemo(
    () => items.filter((item) => !item.isResume),
    [items],
  );

  useEffect(() => {
    const updateScrolled = () => setHasScrolled(window.scrollY > 8);

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  useEffect(() => {
    const sectionIds = standardItems
      .map((item) => item.href)
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1));

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);

        if (visibleEntry) {
          setActiveHref(`#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [standardItems]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[#E4E4E7] bg-white/88 backdrop-blur transition-[background-color,box-shadow,border-color] duration-150",
        hasScrolled && "border-[#D4D4D8] bg-white/95 shadow-sm",
        className,
      )}
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-16 w-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        <a
          className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          href="#top"
        >
          {brandLabel}
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {standardItems.map((item) => (
            <a
              aria-current={activeHref === item.href ? "location" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-150 hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]",
                activeHref === item.href
                  ? "bg-[#CCFBF1] text-[#0F766E]"
                  : "text-[#3F3F46]",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
          {resumeItem ? (
            <a
              className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]"
              href={resumeItem.href}
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              {resumeItem.label}
            </a>
          ) : null}
        </div>
        <Button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="min-h-11 min-w-11 lg:hidden"
          onClick={() => setIsOpen((current) => !current)}
          size="sm"
          variant="secondary"
        >
          {isOpen ? (
            <X aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Menu aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
      </nav>
      <div
        aria-hidden={!isOpen}
        className={cn(
          "grid overflow-hidden border-t border-[#E4E4E7] bg-white px-5 transition-[grid-template-rows,opacity] duration-200 ease-out lg:hidden",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0",
        )}
        id="mobile-navigation"
      >
        <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-col gap-1 overflow-hidden py-4">
          {standardItems.map((item) => (
            <a
              aria-current={activeHref === item.href ? "location" : undefined}
              className={cn(
                "min-h-11 rounded-md px-3 py-3 text-sm font-medium transition-[background-color,color,transform] duration-150 hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]",
                activeHref === item.href
                  ? "bg-[#CCFBF1] text-[#0F766E]"
                  : "text-[#3F3F46]",
              )}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? undefined : -1}
            >
              {item.label}
            </a>
          ))}
          {resumeItem ? (
            <a
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0F766E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99]"
              href={resumeItem.href}
              onClick={() => setIsOpen(false)}
              tabIndex={isOpen ? undefined : -1}
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              {resumeItem.label}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
