import Image from "next/image";
import type { ProjectItem } from "@/types";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: ProjectItem;
  className?: string;
};

function ProjectLinkStatus({
  label,
  note,
}: {
  label: string;
  note?: string;
}) {
  return (
    <p className="text-sm leading-6 text-[#52525B]">
      <span className="font-medium text-[#3F3F46]">{label}:</span>{" "}
      {note ?? "Not available."}
    </p>
  );
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const hasImage =
    project.screenshot.status === "available" &&
    project.screenshot.publicPath &&
    project.screenshot.altText;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border border-[#E4E4E7] bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-md md:p-6",
        className,
      )}
    >
      {project.screenshots?.length ? (
        <div className="mb-5">
          <div className="flex snap-x gap-3 overflow-x-auto pb-3" aria-label={`${project.title} screenshots`}>
            {project.screenshots.map((screenshot) => (
              <div
                className="relative aspect-[1344/2992] w-36 shrink-0 snap-start overflow-hidden rounded-md border border-[#E4E4E7] bg-[#F4F4F5] sm:w-40"
                key={screenshot.publicPath}
              >
                <Image
                  alt={screenshot.altText}
                  className="object-contain"
                  fill
                  sizes="160px"
                  src={screenshot.publicPath}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-[#71717A]">
            Scroll to explore all {project.screenshots.length} screenshots.
          </p>
        </div>
      ) : hasImage ? (
        <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-md border border-[#E4E4E7] bg-[#F4F4F5]">
          <Image
            alt={project.screenshot.altText ?? ""}
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            src={project.screenshot.publicPath ?? ""}
          />
        </div>
      ) : (
        <div className="mb-5 rounded-md border border-dashed border-[#D4D4D8] bg-[#F4F4F5] p-4 text-sm leading-6 text-[#52525B]">
          {project.screenshot.note}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#18181B]">{project.title}</h3>
          <p className="mt-1 text-sm font-medium text-[#3F3F46]">{project.role}</p>
        </div>
        <p className="text-sm font-medium text-[#52525B]">{project.year}</p>
      </div>
      <p className="mt-3 text-sm font-medium text-[#0F766E]">{project.type}</p>
      <p className="mt-4 text-sm leading-6 text-[#3F3F46]">
        {project.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <span
            className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-xs font-medium text-[#3F3F46]"
            key={technology}
          >
            {technology}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-2 border-t border-[#E4E4E7] pt-4">
        <ProjectLinkStatus label={project.liveDemo.label} note={project.liveDemo.note} />
        <ProjectLinkStatus label={project.github.label} note={project.github.note} />
      </div>
      {project.confidentialityNote || project.clientNote ? (
        <p className="mt-4 text-sm leading-6 text-[#52525B]">
          {project.confidentialityNote ?? project.clientNote}
        </p>
      ) : null}
    </article>
  );
}
