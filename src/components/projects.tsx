import { getLocale, getTranslations } from "next-intl/server";

import { ProjectCard } from "@/components/project-card";
import { LitOnView } from "@/components/lit-on-view";
import { SectionShell } from "@/components/section";
import { getProjects } from "@/lib/queries/projects";

/** Grade completa de projetos (todos os publicados, sem campo `featured`). */
export async function ProjectsSection() {
  const locale = await getLocale();
  const [tSections, tProjects, projects] = await Promise.all([
    getTranslations("Sections"),
    getTranslations("Projects"),
    getProjects(locale),
  ]);

  return (
    <SectionShell id="projects" number="04" title={tSections("projects")}>
      {projects.length === 0 ? (
        <p className="font-mono text-sm text-subtle-foreground">
          {tProjects("empty")}
        </p>
      ) : (
        <LitOnView className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant="full"
              index={index}
            />
          ))}
        </LitOnView>
      )}
    </SectionShell>
  );
}
