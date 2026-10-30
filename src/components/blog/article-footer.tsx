import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ArticleRow } from "@/components/blog/article-row";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ArticleCard } from "@/lib/blog";

type ArticleFooterProps = {
  related: readonly ArticleCard[];
};

/**
 * Fecho do artigo: leituras relacionadas (quando o banco as lista) e os dois
 * caminhos de saida - voltar ao indice ou seguir para o contato.
 */
export async function ArticleFooter({ related }: ArticleFooterProps) {
  const t = await getTranslations("Blog");
  const hero = await getTranslations("Hero");

  return (
    <footer className="border-t border-border">
      {related.length > 0 ? (
        <section className="shell py-16 lg:py-24" aria-labelledby="related-title">
          <h2 id="related-title" className="hud-label">
            {t("related")}
          </h2>
          <ul className="article-index mt-6">
            {related.map((article, index) => (
              <ArticleRow key={article.slug} article={article} index={index} />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="shell flex flex-wrap items-center gap-4 border-t border-border py-10 first:border-t-0">
        <Button asChild variant="console" size="console">
          <Link href="/blog">{t("backToBlog")}</Link>
        </Button>
        <Button asChild variant="keyline" size="console">
          <Link href="/#contact">
            {hero("ctaContact")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </footer>
  );
}
