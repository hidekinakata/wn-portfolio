import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ArticleGlyph } from "@/components/blog/article-glyph";
import { ReadingMeter } from "@/components/blog/reading-meter";
import { MaskedText } from "@/components/motion/masked-text";
import { HeroField } from "@/components/sections/hero/hero-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ArticleCard } from "@/lib/blog";
import { CHAR_STEP } from "@/lib/motion";

type BlogMastheadProps = {
  /** O artigo mais recente; `null` com o blog ainda vazio. */
  lead: ArticleCard | null;
};

/** Partitura da estreia, em segundos: titulo, descricao, depois o artigo. */
const AT = { title: 0.06, body: 0.45, lead: 0.55 } as const;

/**
 * Abertura do blog — primeiro viewport. `BLOG` em tipo display sobe da
 * mascara como o nome no hero; atras dele, o circuito do artigo mais recente
 * se desenha de ponta a ponta (entrada lavanda, saida laranja). Com o blog
 * vazio o circuito fica apagado e a abertura diz isso, sem inventar nada.
 * Tudo CSS puro, no servidor.
 */
export async function BlogMasthead({ lead }: BlogMastheadProps) {
  const t = await getTranslations("Blog");

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-border"
    >
      <HeroField />
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <ArticleGlyph
          seed={lead?.slug ?? "idle"}
          size="lg"
          lit={lead !== null}
          delay={0.3}
          className="glyph-boot blog-glyph"
        />
      </div>

      <div className="shell relative z-10 flex min-h-[min(calc(100svh-5rem),52rem)] flex-col justify-end gap-10 pt-28 pb-10 lg:min-h-svh lg:pb-12">
        <div>
          <h1 className="display blog-title hero-name font-extrabold">
            <MaskedText
              text={t("title")}
              split="char"
              pieceClassName="hero-char"
              delay={AT.title}
              step={CHAR_STEP * 2}
              timing="animation"
            />
          </h1>
          <p
            className="hero-rise mt-6 max-w-[34rem] font-mono text-[0.72rem] leading-[1.95] tracking-[0.16em] text-foreground/80 uppercase"
            style={{ animationDelay: `${AT.body}s` }}
          >
            {t("description")}
          </p>
        </div>

        {lead ? <LeadStrip lead={lead} /> : <EmptyStrip />}
      </div>
    </section>
  );
}

/** Faixa do artigo mais recente: um unico link, o bloco inteiro. */
async function LeadStrip({ lead }: { lead: ArticleCard }) {
  const t = await getTranslations("Blog");

  return (
    <Link
      href={`/blog/${lead.slug}`}
      aria-labelledby="blog-lead-title"
      className="blog-lead hero-rise group"
      style={{ animationDelay: `${AT.lead}s` }}
    >
      <div className="min-w-0">
        <h2
          id="blog-lead-title"
          className="blog-lead-title display text-[clamp(1.9rem,3.1vw,2.9rem)] leading-[0.94] font-semibold text-balance"
        >
          {lead.title}
        </h2>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
          <span className="text-foreground">{t("latest")}</span>
          <span className="tabular-nums">{lead.number}</span>
          {lead.dateLabel ? (
            <time dateTime={lead.publishedAt ?? undefined}>
              {lead.dateLabel}
            </time>
          ) : null}
          {lead.minutes !== null ? (
            <span className="flex items-center gap-2.5">
              <span>{t("minutes", { count: lead.minutes })}</span>
              <ReadingMeter minutes={lead.minutes} />
            </span>
          ) : null}
        </p>
      </div>

      <p className="line-clamp-2 max-w-[48ch] text-sm leading-7 text-muted-foreground">
        {lead.intro}
      </p>

      <span
        aria-hidden="true"
        className={`${buttonVariants({ variant: "console", size: "console" })} group-hover:border-lavender group-hover:bg-lavender group-hover:text-background`}
      >
        {t("readArticle")}
        <ArrowRight aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Blog sem artigos: a verdade, e os caminhos que levam ao contato. */
async function EmptyStrip() {
  const t = await getTranslations("Blog");
  const hero = await getTranslations("Hero");

  return (
    <div
      className="hero-rise flex flex-col gap-6 border-t border-border-strong pt-6 lg:flex-row lg:items-center lg:justify-between"
      style={{ animationDelay: `${AT.lead}s` }}
    >
      <p className="font-mono text-sm text-subtle-foreground">{t("empty")}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="console" size="console">
          <Link href="/#projects">
            {hero("ctaProjects")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="keyline" size="console">
          <Link href="/#contact">
            {hero("ctaContact")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
