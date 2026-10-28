import { getLocale, getTranslations } from "next-intl/server";

import { ProjectCard } from "@/components/project-card";
import { Link } from "@/i18n/navigation";
import { getProjects } from "@/lib/queries/projects";

/**
 * Faixa de projetos em destaque no fim do primeiro viewport (a dobra do
 * brief). Sem campo `featured` no banco, destaque = os quatro mais recentes.
 */
export async function FeaturedProjects() {
  const locale = await getLocale();
  const [tFeatured, tProjects, projects] = await Promise.all([
    getTranslations("Featured"),
    getTranslations("Projects"),
    getProjects(locale),
  ]);
  const featured = projects.slice(0, 4);

  return (
    <section className="border-b border-border">
      <div className="shell py-10">
        <div className="flex items-center justify-between gap-6">
          <p className="hud-label">{tFeatured("label")}</p>
          <Link
            href="/#projects"
            className="hud-label transition-none hover:text-foreground"
          >
            {tFeatured("viewAll")}
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-6 font-mono text-sm text-subtle-foreground">
            {tProjects("empty")}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
            {featured.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
