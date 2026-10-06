import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/reveal";
import { Link } from "@/i18n/navigation";

type HeroProps = {
  /** Nome exibido no titulo. Vem do `Profile` no banco (fase 2). */
  name?: string | null;
};

/**
 * Hero da landing page. O cargo (`headline`) e uma string estatica de
 * traducao; o nome vem do banco.
 */
export async function Hero({ name }: HeroProps) {
  const t = await getTranslations("Hero");

  const heading = name ?? t("headline");
  const subheading = name ? t("headline") : null;

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="shell py-24 sm:py-32">
        <Reveal>
          <p className="eyebrow">{t("location")}</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-medium tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {heading}
          </h1>
        </Reveal>

        {subheading ? (
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              {subheading}
            </p>
          </Reveal>
        ) : null}

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/#projects"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {t("ctaProjects")}
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              {t("ctaBlog")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
