import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import {
  getLocale,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleIndex } from "@/components/blog/article-index";
import { BlogMasthead } from "@/components/blog/blog-masthead";
import { ScrollMarker } from "@/components/navigation/scroll-marker";
import { routing } from "@/i18n/routing";
import { toArticleCard } from "@/lib/blog";
import { getArticles } from "@/lib/queries/articles";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Blog" });

  return { title: t("title"), description: t("description") };
}

/**
 * Raiz do blog: abertura monumental + indice dos artigos publicados. O shell
 * e estatico; a parte guiada pelo banco renderiza sob `Suspense`.
 */
export default async function BlogPage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  setRequestLocale(localeParam);

  return (
    <>
      <ScrollMarker />
      <Suspense fallback={<BlogFallback />}>
        <BlogContent />
      </Suspense>
    </>
  );
}

async function BlogContent() {
  const locale = await getLocale();
  const articles = (await getArticles(locale)).map((article) =>
    toArticleCard(article, locale),
  );

  return (
    <>
      <BlogMasthead lead={articles[0] ?? null} />
      {articles.length > 0 ? <ArticleIndex articles={articles} /> : null}
    </>
  );
}

/** Placeholder de altura estavel enquanto o blog carrega. */
function BlogFallback() {
  return (
    <div
      aria-busy="true"
      className="min-h-svh border-b border-border"
      role="status"
    />
  );
}
