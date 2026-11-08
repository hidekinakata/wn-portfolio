import "server-only";

import { cacheLife } from "next/cache";
import {
  bundledLanguages,
  bundledLanguagesAlias,
  codeToTokens,
  type BundledLanguage,
  type ThemeRegistration,
} from "shiki";

export type CodeToken = { content: string; color: string | null };

/** Paleta do console: texto em linho sobre carbono para manter a leitura. */
const CONSOLE_THEME: ThemeRegistration = {
  name: "console",
  type: "dark",
  colors: { "editor.background": "#18181c", "editor.foreground": "#f3eee3" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#f3eee3", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "keyword.control"], settings: { foreground: "#f3eee3", fontStyle: "bold" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#f3eee3" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#f3eee3" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#f3eee3" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"], settings: { foreground: "#f3eee3" } },
    { scope: ["variable.parameter", "variable.other.property"], settings: { foreground: "#f3eee3" } },
    { scope: ["punctuation", "keyword.operator"], settings: { foreground: "#f3eee3" } },
  ],
};

function resolveLanguage(language: string): BundledLanguage | "text" {
  const name = language.trim().toLowerCase();
  return isBundled(name) ? name : "text";
}

function isBundled(name: string): name is BundledLanguage {
  return name in bundledLanguages || name in bundledLanguagesAlias;
}

/**
 * Tokens coloridos, linha a linha. O componente monta `<span>`s a partir
 * deles (sem HTML injetado); o resultado e cacheado porque o codigo de um
 * artigo publicado nao muda entre requisicoes.
 */
export async function highlightCode(
  code: string,
  language: string,
): Promise<CodeToken[][]> {
  "use cache";
  cacheLife("max");

  const { tokens } = await codeToTokens(code, {
    lang: resolveLanguage(language),
    theme: CONSOLE_THEME,
  });

  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      color: token.color ?? null,
    })),
  );
}
