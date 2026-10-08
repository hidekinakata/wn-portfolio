import "server-only";

import type { Language } from "@/generated/prisma/enums";
import { FALLBACK_LANGUAGE } from "@/i18n/languages";

/**
 * Entidades traduzidas carregam no maximo dois idiomas: o pedido e o `en`.
 * `pickTranslation` e o unico ponto que decide qual vence (regra combinada:
 * falta traducao -> cai para `en`).
 */
export type Translatable = { language: Language };

export function pickTranslation<T extends Translatable>(
  translations: readonly T[],
  language: Language,
): T | undefined {
  return (
    translations.find((t) => t.language === language) ??
    translations.find((t) => t.language === FALLBACK_LANGUAGE)
  );
}

/** Idiomas a carregar para um locale de URL (sem duplicar o `en`). */
export function languagesToFetch(language: Language): Language[] {
  return language === FALLBACK_LANGUAGE
    ? [FALLBACK_LANGUAGE]
    : [language, FALLBACK_LANGUAGE];
}
