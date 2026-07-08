import { certifications } from "@/constants/certifications";
import { CertificateCard } from "@/components/shared/certificate-card";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";

export function CertificationsSection() {
  return (
    <SectionContainer
      aria-labelledby="certifications-title"
      className="bg-[#F4F4F5]"
      id="certifications"
    >
      <SectionHeader
        description="Verified professional development and learning milestones."
        id="certifications-title"
        title="Certifications"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {certifications.map((certificate) => (
          <CertificateCard certificate={certificate} key={certificate.title} />
        ))}
      </div>
    </SectionContainer>
  );
}
