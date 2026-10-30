import { formatDay } from "@/lib/dates";
import type { ArticleListItem } from "@/lib/queries/articles";

/** Artigo pronto para exibicao: datas e duracao ja resolvidas no servidor. */
export type ArticleCard = ArticleListItem & {
  dateLabel: string | null;
  /** `null` quando o `readTime` armazenado nao traz numero. */
  minutes: number | null;
};

/** `readTime` e texto livre no banco ("5 min", "10 min read"): extrai o numero. */
export function parseMinutes(readTime: string): number | null {
  const match = /\d+/.exec(readTime);
  return match ? Number(match[0]) : null;
}

export function toArticleCard(
  article: ArticleListItem,
  locale: string,
): ArticleCard {
  return {
    ...article,
    dateLabel: article.publishedAt
      ? formatDay(new Date(article.publishedAt), locale)
      : null,
    minutes: parseMinutes(article.readTime),
  };
}
