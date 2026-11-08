"use client";

import { ArrowUpRight } from "lucide-react";
import { useId } from "react";
import { useTranslations } from "next-intl";

import { ArticleGlyph } from "@/components/blog/article-glyph";
import { ReadingMeter } from "@/components/blog/reading-meter";
import { LitOnView } from "@/components/motion/lit-on-view";
import { MaskedText } from "@/components/motion/masked-text";
import { Link } from "@/i18n/navigation";
import type { ArticleCard } from "@/lib/blog";
import { CHAR_STEP, LAYER_STEP } from "@/lib/motion";

type ArticleRowProps = {
  article: ArticleCard;
  /** Posicao na lista: escalona a estreia das primeiras linhas. */
  index: number;
};

/** Quantas linhas escalonam entre si; as de baixo acendem ao rolar. */
const STAGGER_ROWS = 5;

/**
 * Linha do indice: numero, titulo em tipo display, intro, data, duracao, tags
 * e o glifo. Ao entrar na tela cada linha acende por conta propria (titulo
 * sobe da mascara, glifo se desenha). Sob o cursor ou o foco a linha acende
 * em corte seco e as demais apagam (regras `.article-*` em globals.css).
 */
export function ArticleRow({ article, index }: ArticleRowProps) {
  const t = useTranslations("Blog");
  const titleId = useId();
  const base = Math.min(index, STAGGER_ROWS) * LAYER_STEP;
  const rise = (offset: number) => ({
    transitionDelay: `${(base + offset).toFixed(3)}s`,
  });

  return (
    <li className="border-t border-border last:border-b">
      <LitOnView>
        <Link
          href={`/blog/${article.slug}`}
          aria-labelledby={titleId}
          className="article-row group"
        >
          <span
            className="article-num row-rise font-mono text-xs tracking-[0.22em] [grid-area:num] tabular-nums"
            style={rise(0)}
          >
            {article.number}
          </span>

          <h3
            id={titleId}
            className="article-title display text-[clamp(2.25rem,5.2vw,5.5rem)] leading-[0.92] font-semibold text-balance [grid-area:title]"
          >
            <MaskedText
              text={article.title}
              split="char"
              pieceClassName="sec-char"
              delay={base + 0.08}
              step={CHAR_STEP}
              timing="transition"
            />
            <ArrowUpRight
              aria-hidden="true"
              className="invisible ml-[0.12em] inline size-[0.5em] align-[0.12em] stroke-[2.25] text-foreground group-hover:visible group-focus-visible:visible"
            />
          </h3>

          <p
            className="article-intro row-rise line-clamp-2 max-w-[60ch] text-sm leading-7 [grid-area:intro]"
            style={rise(0.12)}
          >
            {article.intro}
          </p>

          <div
            className="article-meta row-rise flex flex-wrap content-start items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] tracking-[0.18em] uppercase [grid-area:meta] lg:pt-2"
            style={rise(0.06)}
          >
            {article.dateLabel ? (
              <time dateTime={article.publishedAt ?? undefined}>
                {article.dateLabel}
              </time>
            ) : null}
            {article.minutes !== null ? (
              <span className="flex items-center gap-2.5">
                <span>{t("minutes", { count: article.minutes })}</span>
                <ReadingMeter minutes={article.minutes} delay={base + 0.2} />
              </span>
            ) : (
              <span>{article.readTime}</span>
            )}
          </div>

          {article.tags.length > 0 ? (
            <ul
              className="row-rise flex flex-wrap content-start gap-2 [grid-area:tags]"
              style={rise(0.16)}
            >
              {article.tags.map((tag) => (
                <li
                  key={tag.slug}
                  className="article-tag border px-2 py-1 font-mono text-[0.65rem] tracking-[0.12em] uppercase"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          ) : null}

          <ArticleGlyph
            seed={article.slug}
            size="sm"
            delay={base + 0.1}
            className="size-14 justify-self-end border border-border [grid-area:glyph] group-hover:border-violet group-focus-visible:border-violet lg:size-22"
          />
        </Link>
      </LitOnView>
    </li>
  );
}
