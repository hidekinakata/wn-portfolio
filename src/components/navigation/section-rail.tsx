"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { LAYER_STEP } from "@/lib/motion";
import { useActiveSection } from "@/lib/use-active-section";

type RailSection = {
  id: string;
  number: string;
  labelKey: "home" | "about" | "experience" | "projects" | "education";
};

const railSections: readonly RailSection[] = [
  { id: "home", number: "01", labelKey: "home" },
  { id: "about", number: "02", labelKey: "about" },
  { id: "experience", number: "03", labelKey: "experience" },
  { id: "projects", number: "04", labelKey: "projects" },
  { id: "education", number: "05", labelKey: "education" },
];

const RAIL_IDS = railSections.map(({ id }) => id);

/**
 * Trilho numerado do console: posicao atual da leitura. Os numeros carregam
 * informacao real (a sequencia das secoes), o item ativo e "aceso" e os
 * restantes ficam em estado fantasma desenhado.
 */
export function SectionRail() {
  const t = useTranslations("Nav");
  const activeId = useActiveSection({ ids: RAIL_IDS }) ?? "home";

  return (
    <nav
      aria-label={t("menu")}
      className="fixed top-1/2 left-8 z-40 hidden -translate-y-1/2 flex-col gap-12 xl:flex"
    >
      {railSections.map(({ id, number, labelKey }, index) => {
        const isActive = id === activeId;

        return (
          <Link
            key={id}
            href={`/#${id}`}
            className="chrome-rise group flex flex-col gap-2"
            style={{ animationDelay: `${0.3 + index * LAYER_STEP}s` }}
            data-active={isActive}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Ao virar ativo, a cor assenta (`rail-text`); ao sair, corta. */}
            <span
              className={
                isActive
                  ? "rail-text font-mono text-sm tracking-[0.2em] text-foreground"
                  : "font-mono text-sm tracking-[0.2em] text-subtle-foreground transition-none group-hover:text-foreground"
              }
            >
              {number}
            </span>
            <span
              className={
                isActive
                  ? "rail-text hud-label text-[0.6rem] text-foreground"
                  : "hud-label text-[0.6rem] transition-none group-hover:text-muted-foreground"
              }
            >
              {t(labelKey)}
            </span>
            <span className="rail-dot" aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
