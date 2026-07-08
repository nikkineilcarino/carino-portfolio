import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionContainerProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  "aria-labelledby"?: string;
};

export function SectionContainer({
  id,
  children,
  className,
  contentClassName,
  "aria-labelledby": ariaLabelledBy,
}: SectionContainerProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      className={cn("px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20", className)}
      id={id}
    >
      <div className={cn("mx-auto w-full max-w-[1120px]", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
