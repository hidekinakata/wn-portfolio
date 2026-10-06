import type en from "@/messages/en.json";

/**
 * Augmentacao de modulo do next-intl: torna `t()` e `getTranslations()`
 * tipados a partir das chaves reais de `src/messages/en.json`.
 */
declare module "next-intl" {
  interface AppConfig {
    Locale: "en" | "pt-BR";
    Messages: typeof en;
  }
}

export {};
