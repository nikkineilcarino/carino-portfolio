import { FileText, GitBranch, Mail, Phone } from "lucide-react";
import { contactContent } from "@/constants/site";
import { ContactButton } from "@/components/shared/contact-button";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";

export function ContactSection() {
  return (
    <SectionContainer
      aria-labelledby="contact-title"
      className="bg-[#F4F4F5]"
      id="contact"
    >
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <SectionHeader
            description={contactContent.message}
            id="contact-title"
            title={contactContent.title}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-col">
            <ContactButton
              className="w-full"
              href={`mailto:${contactContent.email}`}
              icon={Mail}
              label={contactContent.email}
            />
            <ContactButton
              className="w-full"
              href={`tel:${contactContent.phone.replaceAll("-", "")}`}
              icon={Phone}
              label={contactContent.phone}
            />
            <ContactButton
              className="w-full"
              href={`https://${contactContent.github}`}
              icon={GitBranch}
              isExternal
              label={contactContent.github}
            />
            <ContactButton
              className="w-full"
              href={contactContent.resume.href ?? "#"}
              icon={FileText}
              label={contactContent.resume.label}
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
