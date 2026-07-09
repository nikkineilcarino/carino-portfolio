import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PortfolioAiAssistant } from "@/components/ai/portfolio-ai-assistant";
import { AboutSection } from "@/components/sections/about-section";
import { CertificationsSection } from "@/components/sections/certifications-section";
import { ContactSection } from "@/components/sections/contact-section";
import { EducationSection } from "@/components/sections/education-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { HeroSection } from "@/components/sections/hero-section";
import { LeadershipSection } from "@/components/sections/leadership-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { Reveal } from "@/components/shared/reveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B]">
      <a
        className="absolute left-5 top-4 z-[60] inline-flex min-h-11 -translate-y-20 items-center rounded-md bg-[#18181B] px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 focus:translate-y-0 focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        href="#main-content"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <Reveal>
          <AboutSection />
        </Reveal>
        <Reveal>
          <SkillsSection />
        </Reveal>
        <Reveal>
          <ExperienceSection />
        </Reveal>
        <Reveal>
          <ProjectsSection />
        </Reveal>
        <Reveal>
          <LeadershipSection />
        </Reveal>
        <Reveal>
          <CertificationsSection />
        </Reveal>
        <Reveal>
          <EducationSection />
        </Reveal>
        <Reveal>
          <ContactSection />
        </Reveal>
      </main>
      <Footer />
      <PortfolioAiAssistant />
    </div>
  );
}
