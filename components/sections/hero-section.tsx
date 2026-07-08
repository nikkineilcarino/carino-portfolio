import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import { heroContent, profileAsset } from "@/constants/site";
import { ScrollIndicator } from "@/components/shared/scroll-indicator";

export function HeroSection() {
  return (
    <section
      className="px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10 lg:pb-20 lg:pt-20"
      id="top"
    >
      <div className="mx-auto grid w-full max-w-[1120px] items-center gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-[#0F766E]">
            {heroContent.role}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#18181B] sm:text-5xl lg:text-6xl">
            {heroContent.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[#3F3F46]">
            {heroContent.descriptor}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#52525B]">
            {heroContent.summary}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0F766E] px-5 py-3 text-[0.9375rem] font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#115E59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99] sm:w-auto"
              href={heroContent.primaryAction.href}
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              {heroContent.primaryAction.label}
            </a>
            <a
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-5 py-3 text-[0.9375rem] font-semibold text-[#18181B] shadow-sm transition-[background-color,transform] duration-150 hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] active:scale-[0.99] sm:w-auto"
              href={heroContent.secondaryAction.href}
            >
              {heroContent.secondaryAction.label}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10">
            <ScrollIndicator href="#about" label="About Me" />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[360px] rounded-lg bg-[#CCFBF1] p-3 shadow-md sm:max-w-[420px] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/70 bg-white">
            <Image
              alt={profileAsset.altText}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 360px, 100vw"
              src={profileAsset.publicPath}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
