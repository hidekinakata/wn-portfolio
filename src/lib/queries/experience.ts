import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db";
import { toLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";

import {
  languagesToFetch,
  pickTranslation,
} from "@/lib/queries/shared";

export type ExperienceItem = {
  id: string;
  company: string;
  position: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
};

/** Experiencias ordenadas por inicio desc, com fallback `en` por item. */
export async function getExperiences(
  locale: Locale,
): Promise<ExperienceItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("experiences", `experiences:${locale}`);

  const language = toLanguage(locale);
  const experiences = await prisma.experience.findMany({
    orderBy: { startDate: "desc" },
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, position: true, description: true },
      },
    },
  });

  return experiences.flatMap((experience) => {
    const translation = pickTranslation(experience.translations, language);
    if (!translation) return [];

    return [
      {
        id: experience.id,
        company: experience.company,
        position: translation.position,
        description: translation.description,
        startDate: experience.startDate,
        endDate: experience.endDate,
        current: experience.current,
      },
    ];
  });
}
