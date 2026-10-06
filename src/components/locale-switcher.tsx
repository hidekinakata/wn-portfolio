"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const shortLabel: Record<Locale, string> = {
  en: "EN",
  "pt-BR": "PT",
};

/**
 * Alternador de idioma. Preserva o caminho atual (sem prefixo de locale) e
 * troca apenas o prefixo — o `Link` do next-intl cuida disso.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("label")}
      className="flex items-center gap-1 font-mono text-xs"
    >
      {routing.locales.map((value) => {
        const isActive = value === locale;

        return (
          <Link
            key={value}
            href={pathname}
            locale={value}
            aria-current={isActive ? "true" : undefined}
            className={
              isActive
                ? "rounded-full border border-border-strong px-3 py-1 text-foreground"
                : "rounded-full border border-transparent px-3 py-1 text-subtle-foreground transition-colors hover:text-foreground"
            }
          >
            <span aria-hidden="true">{shortLabel[value]}</span>
            <span className="sr-only">{t(value)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
