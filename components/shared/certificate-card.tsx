import Image from "next/image";
import type { CertificationItem } from "@/types";
import { cn } from "@/lib/utils";

type CertificateCardProps = {
  certificate: CertificationItem;
  className?: string;
};

export function CertificateCard({
  certificate,
  className,
}: CertificateCardProps) {
  const hasImage =
    certificate.image.status === "available" &&
    certificate.image.publicPath &&
    certificate.image.altText;

  return (
    <article
      className={cn(
        "rounded-lg border border-[#E4E4E7] bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-md",
        className,
      )}
    >
      {hasImage ? (
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md border border-[#E4E4E7] bg-[#F4F4F5]">
          <Image
            alt={certificate.image.altText ?? ""}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
            src={certificate.image.publicPath ?? ""}
          />
        </div>
      ) : null}
      <p className="text-sm font-medium text-[#B45309]">{certificate.year}</p>
      <h3 className="mt-2 text-lg font-semibold leading-snug text-[#18181B]">
        {certificate.title}
      </h3>
    </article>
  );
}
