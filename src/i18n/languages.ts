import { Language } from "@/generated/prisma/enums";

import type { Locale } from "./routing";

/**
 * A URL usa `pt-BR`/`en`, mas o enum `Language` do banco usa `pt_BR`/`en`.
 * Estes maps sao o unico ponto de traducao entre os dois espacos de nome.
 */
export const localeToLanguage: Readonly<Record<Locale, Language>> = {
  en: Language.en,
  "pt-BR": Language.pt_BR,
};

export const languageToLocale: Readonly<Record<Language, Locale>> = {
  [Language.en]: "en",
  [Language.pt_BR]: "pt-BR",
};

/**
 * Idioma de fallback quando uma traducao nao existe no idioma solicitado
 * (ex.: artigo so em `en`, acessado em `/pt-BR/...`).
 * Regra combinada: o conteudo cai sempre para `en`.
 */
export const FALLBACK_LANGUAGE: Language = Language.en;

/** Converte o locale de URL no enum do banco. */
export function toLanguage(locale: Locale): Language {
  return localeToLanguage[locale];
}

/** Converte o enum do banco no locale de URL. */
export function toLocale(language: Language): Locale {
  return languageToLocale[language];
}
