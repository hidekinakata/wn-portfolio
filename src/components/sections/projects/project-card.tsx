import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { LAYER_STEP } from "@/lib/motion";
import type { ProjectItem } from "@/lib/queries/projects";

type ProjectCardProps = {
  project: ProjectItem;
  /** `compact` para a faixa de destaque; `full` para a grade de projetos. */
  variant: "compact" | "full";
  /** Posicao na lista: escalona a entrada (`LAYER_STEP` por cartao). */
  index?: number;
};

/**
 * Cartao de projeto do console: hairline, titulo mono, tags, seta. Sem
 * pagina de detalhe ainda — o link so existe quando o projeto tem URL real
 * (site ou repositorio).
 */
export function ProjectCard({ project, variant, index = 0 }: ProjectCardProps) {
  const t = useTranslations("Projects");

  const href = project.link ?? project.github;
  const typeLabel =
    project.type === "professional" ? t("typeProfessional") : t("typePersonal");

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="hud-label text-subtle-foreground">{typeLabel}</p>
          <h3
            className={`mt-3 font-mono font-semibold text-foreground uppercase ${
              variant === "full"
                ? "text-lg tracking-[0.08em]"
                : "text-sm tracking-[0.12em]"
            }`}
          >
            {project.title}
          </h3>
        </div>
        <ArrowUpRight
          aria-hidden="true"
          className="size-5 shrink-0 text-subtle-foreground"
        />
      </div>

      {project.description ? (
        <p
          className={`max-w-[72ch] text-sm text-muted-foreground ${
            variant === "full"
              ? "mt-4 line-clamp-4 leading-7"
              : "mt-3 line-clamp-2 leading-6"
          }`}
        >
          {project.description}
        </p>
      ) : null}

      {project.tags.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="border border-border px-2 py-1 font-mono text-[0.65rem] tracking-[0.12em] text-subtle-foreground uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  const frameClass = `card-in flex h-full flex-col justify-between border border-border bg-card/50 transition-none hover:border-flow ${variant === "full" ? "p-7" : "p-6"}`;
  const delay = { animationDelay: `${index * LAYER_STEP}s` };

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={frameClass}
      style={delay}
      aria-label={`${project.title} — ${t("viewProject")}`}
    >
      {body}
    </a>
  ) : (
    <article className={frameClass} style={delay}>
      {body}
    </article>
  );
}
