import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { LanguageLevel } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { toLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";

import {
  languagesToFetch,
  pickTranslation,
} from "@/lib/queries/shared";

export type EducationItem = {
  id: string;
  institution: string;
  degree: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
};

export type CertificationItem = {
  id: string;
  name: string;
  issuer: string;
  url: string | null;
  issuedAt: Date | null;
};

export type LanguageItem = {
  id: string;
  name: string;
  levelKey: LanguageLevel;
};

export type EducationBundle = {
  educations: EducationItem[];
  certifications: CertificationItem[];
};

/** Idiomas vivem no bloco "sobre" (decisao do plano), nao no de educacao. */
export async function getLanguages(locale: Locale): Promise<LanguageItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("languages", `languages:${locale}`);

  const language = toLanguage(locale);
  const proficiencies = await prisma.languageProficiency.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, name: true },
      },
    },
  });

  return proficiencies.flatMap((proficiency) => {
    const translation = pickTranslation(proficiency.translations, language);
    if (!translation) return [];

    return [
      {
        id: proficiency.id,
        name: translation.name,
        levelKey: proficiency.levelKey,
      },
    ];
  });
}

/**
 * Bloco de educacao: educacao + certificacoes num unica entrada de cache
 * (as duas consultas rodam em paralelo).
 */
export async function getEducationBundle(
  locale: Locale,
): Promise<EducationBundle> {
  "use cache";
  cacheLife("hours");
  cacheTag("education", "certifications", `education:${locale}`);

  const language = toLanguage(locale);
  const [educations, certifications] = await Promise.all([
    prisma.education.findMany({
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
      include: {
        translations: {
          where: { language: { in: languagesToFetch(language) } },
          select: { language: true, degree: true, description: true },
        },
      },
    }),
    prisma.certification.findMany({
      orderBy: [{ sortOrder: "asc" }, { issuedAt: "desc" }],
    }),
  ]);

  return {
    educations: educations.flatMap((education) => {
      const translation = pickTranslation(education.translations, language);
      if (!translation) return [];

      return [
        {
          id: education.id,
          institution: education.institution,
          degree: translation.degree,
          description: translation.description,
          startDate: education.startDate,
          endDate: education.endDate,
          current: education.current,
        },
      ];
    }),
    certifications: certifications.map((certification) => ({
      id: certification.id,
      name: certification.name,
      issuer: certification.issuer,
      url: certification.url,
      issuedAt: certification.issuedAt,
    })),
  };
}
