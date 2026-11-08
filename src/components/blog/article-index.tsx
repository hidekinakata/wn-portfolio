"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ArticleRow } from "@/components/blog/article-row";
import { LitOnView } from "@/components/motion/lit-on-view";
import { MaskedText } from "@/components/motion/masked-text";
import type { ArticleCard } from "@/lib/blog";
import { CHAR_STEP } from "@/lib/motion";

/** Mais tags que isto vira parede de botoes; as mais usadas ficam. */
const MAX_TAG_KEYS = 12;

type ArticleIndexProps = {
  articles: readonly ArticleCard[];
};

type TagKey = {
  slug: string;
  name: string;
  count: number;
};

/**
 * Indice de artigos: cabecalho, chaves de tag e as linhas. As chaves sao
 * botoes com `aria-pressed` (acesas/apagadas, sem transicao) e so existem
 * quando filtrar tem utilidade. Trocar o filtro remonta a lista, que acende
 * de novo. Estado local: nada aqui precisa sobreviver a uma navegacao.
 */
export function ArticleIndex({ articles }: ArticleIndexProps) {
  const t = useTranslations("Blog");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagKeys = useMemo(() => {
    const counts = new Map<string, TagKey>();
    for (const article of articles) {
      for (const tag of article.tags) {
        const known = counts.get(tag.slug);
        counts.set(tag.slug, {
          slug: tag.slug,
          name: tag.name,
          count: (known?.count ?? 0) + 1,
        });
      }
    }
    return [...counts.values()]
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, MAX_TAG_KEYS);
  }, [articles]);

  const showFilter = articles.length > 1 && tagKeys.length > 1;
  const visible = activeTag
    ? articles.filter((article) =>
        article.tags.some((tag) => tag.slug === activeTag),
      )
    : articles;

  return (
    <section id="index" className="scroll-mt-20 border-b border-border">
      <div className="shell py-14 lg:py-20">
        <LitOnView>
          <header className="relative flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pb-5">
            <h2 className="display text-[clamp(2.25rem,4.2vw,3.5rem)] text-foreground">
              <MaskedText
                text={t("index")}
                split="char"
                pieceClassName="sec-char"
                delay={0.14}
                step={CHAR_STEP}
                timing="transition"
              />
            </h2>
            <p className="sec-num hud-label tabular-nums">
              {String(visible.length).padStart(2, "0")} /{" "}
              {String(articles.length).padStart(2, "0")}
            </p>
            <span
              aria-hidden="true"
              className="sec-rule absolute inset-x-0 bottom-0 h-px"
            />
          </header>
        </LitOnView>

        {showFilter ? (
          <div
            role="group"
            aria-label={t("filterLabel")}
            className="flex flex-wrap gap-2 pt-6"
          >
            <TagKeyButton
              pressed={activeTag === null}
              onPress={() => setActiveTag(null)}
            >
              {t("filterAll")}
              <span className="text-subtle-foreground tabular-nums">{articles.length}</span>
            </TagKeyButton>
            {tagKeys.map((tag) => (
              <TagKeyButton
                key={tag.slug}
                pressed={activeTag === tag.slug}
                onPress={() => setActiveTag(tag.slug)}
              >
                {tag.name}
                <span className="text-subtle-foreground tabular-nums">{tag.count}</span>
              </TagKeyButton>
            ))}
          </div>
        ) : null}

        <p role="status" className="sr-only">
          {t("showing", { count: visible.length })}
        </p>

        <ol
          key={activeTag ?? "all"}
          className="article-index mt-8 lg:mt-10"
        >
          {visible.map((article, index) => (
            <ArticleRow key={article.id} article={article} index={index} />
          ))}
        </ol>
      </div>
    </section>
  );
}

type TagKeyButtonProps = {
  pressed: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

function TagKeyButton({ pressed, onPress, children }: TagKeyButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPress}
      className="tag-key inline-flex items-center gap-2.5 rounded-lg border py-2 pr-3 pl-2.5 font-mono text-xs leading-[1.2] tracking-[0.08em] uppercase"
    >
      {children}
    </button>
  );
}
