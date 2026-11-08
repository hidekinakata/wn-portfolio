import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ArticleGlyph } from "@/components/blog/article-glyph";
import { ReadingMeter } from "@/components/blog/reading-meter";
import { MaskedText } from "@/components/motion/masked-text";
import { HeroField } from "@/components/sections/hero/hero-field";
import { Link } from "@/i18n/navigation";
import type { ArticleCard } from "@/lib/blog";
import { CHAR_STEP } from "@/lib/motion";

type ArticleHeaderProps = {
  article: ArticleCard;
};

/** Partitura da estreia, em segundos: voltar, titulo, intro, depois a meta. */
const AT = { back: 0.04, title: 0.1, intro: 0.5, meta: 0.6 } as const;

/**
 * Abertura do artigo: o circuito proprio do slug se desenha atras, o titulo
 * sobe da mascara e a meta fecha a faixa. Tudo CSS puro, no servidor - a
 * mesma gramatica da abertura do indice.
 */
export async function ArticleHeader({ article }: ArticleHeaderProps) {
  const t = await getTranslations("Blog");

  return (
    <header className="relative isolate overflow-hidden border-b border-border">
      <HeroField />
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <ArticleGlyph
          seed={article.slug}
          size="lg"
          lit
          delay={0.3}
          className="glyph-boot blog-glyph opacity-40"
        />
      </div>

      <div className="shell relative z-10 flex min-h-[min(calc(100svh-5rem),46rem)] flex-col justify-end gap-8 pt-28 pb-10 lg:pb-14">
        <Link
          href="/blog"
          className="hero-rise inline-flex w-fit items-center gap-2.5 font-mono text-[0.7rem] tracking-[0.18em] text-subtle-foreground uppercase transition-none hover:text-foreground"
          style={{ animationDelay: `${AT.back}s` }}
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          {t("backToBlog")}
        </Link>

        <div>
          <p
            className="hero-rise font-mono text-xs tracking-[0.22em] text-foreground tabular-nums"
            style={{ animationDelay: `${AT.back}s` }}
          >
            {article.number}
          </p>
          <h1 className="display mt-4 max-w-[16ch] text-[clamp(3rem,9vw,8rem)] leading-[0.88] font-extrabold text-balance text-foreground">
            <MaskedText
              text={article.title}
              split="char"
              pieceClassName="hero-char"
              delay={AT.title}
              step={CHAR_STEP}
              timing="animation"
            />
          </h1>
          <p
            className="hero-rise mt-8 max-w-[52ch] text-base leading-8 text-muted-foreground lg:text-lg"
            style={{ animationDelay: `${AT.intro}s` }}
          >
            {article.intro}
          </p>
        </div>

        <div
          className="hero-rise flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border-strong pt-5 font-mono text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase"
          style={{ animationDelay: `${AT.meta}s` }}
        >
          {article.dateLabel ? (
            <time dateTime={article.publishedAt ?? undefined}>
              {article.dateLabel}
            </time>
          ) : null}
          {article.minutes !== null ? (
            <span className="flex items-center gap-2.5">
              <span>{t("minutes", { count: article.minutes })}</span>
              <ReadingMeter minutes={article.minutes} delay={AT.meta} />
            </span>
          ) : (
            <span>{article.readTime}</span>
          )}
          {article.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li
                  key={tag.slug}
                  className="border border-border-strong px-2 py-1 text-[0.65rem] tracking-[0.12em] text-subtle-foreground"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
}
