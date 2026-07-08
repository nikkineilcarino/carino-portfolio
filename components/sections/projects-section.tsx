import { projects } from "@/constants/projects";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeader } from "@/components/shared/section-header";
import { ProjectCard } from "@/components/shared/project-card";

export function ProjectsSection() {
  return (
    <SectionContainer
      aria-labelledby="projects-title"
      className="bg-[#F4F4F5]"
      contentClassName="max-w-[1200px]"
      id="projects"
    >
      <SectionHeader
        description="Selected academic, internship, and client-facing work, presented with confidentiality-safe details."
        id="projects-title"
        title="Projects"
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </SectionContainer>
  );
}
