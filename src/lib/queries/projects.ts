import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { ProjectType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { toLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";

import {
  languagesToFetch,
  pickTranslation,
} from "@/lib/queries/shared";

export type ProjectItem = {
  id: string;
  slug: string | null;
  type: ProjectType;
  imageUrl: string | null;
  link: string | null;
  github: string | null;
  title: string;
  description: string | null;
  tags: string[];
};

/** Projetos por criacao desc; titulo/descricao com fallback `en`. */
export async function getProjects(locale: Locale): Promise<ProjectItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("projects", `projects:${locale}`);

  const language = toLanguage(locale);
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, title: true, description: true },
      },
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return projects.flatMap((project) => {
    const translation = pickTranslation(project.translations, language);
    if (!translation) return [];

    return [
      {
        id: project.id,
        slug: project.slug,
        type: project.type,
        imageUrl: project.imageUrl,
        link: project.link,
        github: project.github,
        title: translation.title,
        description: translation.description,
        tags: project.tags.map((entry) => entry.tag.name),
      },
    ];
  });
}
