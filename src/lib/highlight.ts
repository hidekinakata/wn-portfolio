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

/** Paleta do console: lavanda e azul para estrutura, laranja so em literais. */
const CONSOLE_THEME: ThemeRegistration = {
  name: "console",
  type: "dark",
  colors: { "editor.background": "#0b0f1a", "editor.foreground": "#c9c5b8" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#5d6a8a" } },
    { scope: ["keyword", "storage", "keyword.control"], settings: { foreground: "#b9b4ff" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#ffa26b" } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#ff7a2f" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#8da2ff" } },
    { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"], settings: { foreground: "#e8e4d7" } },
    { scope: ["variable.parameter", "variable.other.property"], settings: { foreground: "#c9c5b8" } },
    { scope: ["punctuation", "keyword.operator"], settings: { foreground: "#7480a0" } },
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
