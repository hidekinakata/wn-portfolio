import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleBody } from "@/components/blog/article-body";
import { ArticleFooter } from "@/components/blog/article-footer";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleToc } from "@/components/blog/article-toc";
import { ScrollMarker } from "@/components/navigation/scroll-marker";
import { routing } from "@/i18n/routing";
import { toArticleCard } from "@/lib/blog";
import { getArticle, getArticles } from "@/lib/queries/articles";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

/**
 * Com Cache Components, o `usePathname` do chrome do layout so prerenderiza
 * com o slug conhecido. Pre-renderiza os artigos publicados; slugs novos
 * renderizam sob demanda.
 */
export async function generateStaticParams() {
  const slugs = new Set<string>();
  for (const locale of routing.locales) {
    for (const article of await getArticles(locale)) slugs.add(article.slug);
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;
  const article = await getArticle(slug, locale);
  if (!article) {
    const t = await getTranslations({ locale, namespace: "Common" });
    return { title: t("notFoundTitle") };
  }

  return { title: article.title, description: article.intro };
}

/**
 * Pagina de leitura de um artigo. O shell e estatico; o artigo (guiado pelo
 * banco) renderiza sob `Suspense`.
 */
export default async function ArticlePage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  setRequestLocale(localeParam);

  return (
    <>
      <ScrollMarker />
      <Suspense fallback={<ArticleFallback />}>
        <ArticleContent slug={slug} />
      </Suspense>
    </>
  );
}

async function ArticleContent({ slug }: { slug: string }) {
  const locale = await getLocale();
  const [article, all] = await Promise.all([
    getArticle(slug, locale),
    getArticles(locale),
  ]);
  if (!article) notFound();

  const card = toArticleCard(article, locale);
  const related = all
    .filter((entry) => article.relatedSlugs.includes(entry.slug))
    .map((entry) => toArticleCard(entry, locale));

  return (
    <article>
      <ArticleHeader article={card} />
      <div className="shell py-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <ArticleToc
          sections={article.sections.map(({ id, number, title }) => ({
            id,
            number,
            title,
          }))}
        />
        <ArticleBody sections={article.sections} />
      </div>
      <ArticleFooter related={related} />
    </article>
  );
}

/** Placeholder de altura estavel enquanto o artigo carrega. */
function ArticleFallback() {
  return (
    <div
      aria-busy="true"
      className="min-h-svh border-b border-border"
      role="status"
    />
  );
}
