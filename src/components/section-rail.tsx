"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

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

/**
 * Trilho numerado do console: posicao atual da leitura. Os numeros carregam
 * informacao real (a sequencia das secoes), o item ativo e "aceso" e os
 * restantes ficam em estado fantasma desenhado.
 */
export function SectionRail() {
  const t = useTranslations("Nav");
  const [activeId, setActiveId] = useState<string>("home");

  useEffect(() => {
    const sections = railSections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label={t("menu")}
      className="fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 flex-col gap-7 xl:flex"
    >
      {railSections.map(({ id, number, labelKey }) => {
        const isActive = id === activeId;

        return (
          <Link
            key={id}
            href={`/#${id}`}
            className="group flex items-center gap-3"
            aria-current={isActive ? "true" : undefined}
          >
            <span
              className={
                isActive
                  ? "size-1.5 rounded-full bg-flow"
                  : "size-1.5 rounded-full bg-ghost transition-none group-hover:bg-subtle-foreground"
              }
              aria-hidden="true"
            />
            <span className="flex flex-col gap-1">
              <span
                className={
                  isActive
                    ? "font-mono text-[0.65rem] tracking-[0.18em] text-flow"
                    : "font-mono text-[0.65rem] tracking-[0.18em] text-ghost transition-none group-hover:text-subtle-foreground"
                }
              >
                {number}
              </span>
              <span
                className={
                  isActive
                    ? "hud-label text-foreground"
                    : "hud-label transition-none group-hover:text-muted-foreground"
                }
              >
                {t(labelKey)}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
