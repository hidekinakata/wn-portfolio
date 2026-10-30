import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/db";
import { toLanguage } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import { parseSections, type ArticleSection } from "@/lib/article-content";

import { languagesToFetch, pickTranslation } from "@/lib/queries/shared";

export type ArticleTagItem = {
  name: string;
  slug: string;
};

export type ArticleListItem = {
  id: string;
  slug: string;
  number: string;
  readTime: string;
  /** ISO 8601; `null` so quando o artigo publicado nao tem data. */
  publishedAt: string | null;
  title: string;
  intro: string;
  tags: ArticleTagItem[];
};

/**
 * Artigos publicados, do mais recente ao mais antigo. Titulo e intro com
 * fallback `en`; so entram os que tem alguma traducao utilizavel.
 */
export async function getArticles(locale: Locale): Promise<ArticleListItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `articles:${locale}`);

  const language = toLanguage(locale);
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, title: true, intro: true },
      },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });

  return articles.flatMap((article) => {
    const translation = pickTranslation(article.translations, language);
    if (!translation) return [];

    return [
      {
        id: article.id,
        slug: article.slug,
        number: article.number,
        readTime: article.readTime,
        publishedAt: article.publishedAt?.toISOString() ?? null,
        title: translation.title,
        intro: translation.intro,
        tags: article.tags.map((entry) => ({
          name: entry.tag.name,
          slug: entry.tag.slug,
        })),
      },
    ];
  });
}

export type ArticleDetail = ArticleListItem & {
  relatedSlugs: string[];
  sections: ArticleSection[];
};

/**
 * Um artigo publicado pelo slug, com o corpo em blocos validados. `null` se
 * nao existe, esta em rascunho ou nao tem traducao utilizavel.
 */
export async function getArticle(
  slug: string,
  locale: Locale,
): Promise<ArticleDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("articles", `articles:${locale}`, `article:${slug}`);

  const language = toLanguage(locale);
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
    include: {
      translations: {
        where: { language: { in: languagesToFetch(language) } },
        select: { language: true, title: true, intro: true, sections: true },
      },
      tags: { include: { tag: { select: { name: true, slug: true } } } },
    },
  });
  if (!article) return null;

  const translation = pickTranslation(article.translations, language);
  if (!translation) return null;

  return {
    id: article.id,
    slug: article.slug,
    number: article.number,
    readTime: article.readTime,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    title: translation.title,
    intro: translation.intro,
    tags: article.tags.map((entry) => ({
      name: entry.tag.name,
      slug: entry.tag.slug,
    })),
    relatedSlugs: article.relatedSlugs,
    sections: parseSections(translation.sections),
  };
}
