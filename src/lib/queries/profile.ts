import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db";
import { toLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";

import {
  languagesToFetch,
  pickTranslation,
} from "@/lib/queries/shared";

export type ProfileView = {
  name: string;
  email: string | null;
  github: string | null;
  linkedin: string | null;
  bio: string | null;
  cvUrl: string | null;
};

/** Perfil unico (`key = "default"`) com bio/cvUrl traduzidos e fallback `en`. */
export async function getProfile(locale: Locale): Promise<ProfileView | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("profile", `profile:${locale}`);

  const language = toLanguage(locale);
  const profile = await prisma.profile.findUnique({
    where: { key: "default" },
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, bio: true, cvUrl: true },
      },
    },
  });

  if (!profile) return null;

  const translation = pickTranslation(profile.translations, language);

  return {
    name: profile.name,
    email: profile.email,
    github: profile.github,
    linkedin: profile.linkedin,
    bio: translation?.bio ?? null,
    cvUrl: translation?.cvUrl ?? null,
  };
}
