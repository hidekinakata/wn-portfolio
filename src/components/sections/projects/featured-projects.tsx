import { getLocale, getTranslations } from "next-intl/server";

import { LitOnView } from "@/components/motion/lit-on-view";
import { ProjectCard } from "@/components/sections/projects/project-card";
import { Link } from "@/i18n/navigation";
import { getProjects } from "@/lib/queries/projects";

/**
 * Faixa de projetos em destaque logo apos o hero. No desktop o hero ocupa o
 * viewport inteiro e ela vive apos a dobra. Sem campo `featured` no banco,
 * destaque = os quatro mais recentes; com menos de dois, evita repeticao.
 */
export async function FeaturedProjects() {
  const locale = await getLocale();
  const [tFeatured, projects] = await Promise.all([
    getTranslations("Featured"),
    getProjects(locale),
  ]);
  const featured = projects.slice(0, 4);

  if (projects.length < 2) return null;

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

        <LitOnView className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
          {featured.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              variant="compact"
              index={index}
            />
          ))}
        </LitOnView>
      </div>
    </section>
  );
}
