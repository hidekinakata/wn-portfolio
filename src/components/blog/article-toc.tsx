"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { useActiveSection } from "@/lib/use-active-section";

type ArticleTocProps = {
  sections: readonly { id: string; number: string; title: string }[];
};

/**
 * Sumario fixo ao lado do texto (so de lg para cima). A secao em leitura
 * acende em corte seco; clicar rola ate ela pelo ancora nativa (o Lenis cuida
 * da suavizacao).
 */
export function ArticleToc({ sections }: ArticleTocProps) {
  const t = useTranslations("Blog");
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useActiveSection({ ids });

  return (
    <nav
      aria-label={t("contents")}
      className="sticky top-28 hidden self-start lg:block"
    >
      <p className="hud-label">{t("contents")}</p>
      <ol className="mt-5 space-y-1">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "location" : undefined}
                className={`flex gap-3 border-t py-2.5 text-sm leading-snug transition-none ${active ? "border-violet text-foreground" : "border-border text-subtle-foreground hover:text-muted-foreground"}`}
              >
                <span
                  className={`font-mono text-[0.68rem] tracking-[0.18em] tabular-nums ${active ? "text-flare" : ""}`}
                >
                  {section.number}
                </span>
                <span>{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
