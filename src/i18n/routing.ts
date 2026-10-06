import { defineRouting } from "next-intl/routing";

/**
 * Rotas internacionalizadas.
 *
 * Segmentos de URL fixos em ingles (`/blog`, `/projects`) para os dois idiomas —
 * apenas o prefixo de locale muda. O slug de artigo/projeto e unico no banco,
 * compartilhado entre idiomas.
 */
export const routing = defineRouting({
  locales: ["en", "pt-BR"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
