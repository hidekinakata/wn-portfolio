"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useTranslations } from "next-intl";

/**
 * Marcador SCROLL / EXPLORE do console, fixo na borda direita (par do trilho
 * numerado a esquerda). O cursor anelado e o preenchimento do trilho seguem o
 * progresso real da leitura, com a leitura em porcentagem embaixo. Chrome
 * puro: a posicao ja e informada pelo proprio scroll, por isso `aria-hidden`.
 */
export function ScrollMarker() {
  const t = useTranslations("Hero");
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Mola curta: o cursor acompanha o Lenis sem tremer; sem mola quando o
  // usuario prefere menos movimento.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    mass: 0.4,
  });
  const progress = reducedMotion ? scrollYProgress : smooth;

  const knobTop = useTransform(progress, (value) => `${value * 100}%`);
  // O rastro so aparece quando ha trilho percorrido acima do cursor.
  const trailOpacity = useTransform(progress, [0, 0.12], [0, 1]);
  const percent = useTransform(scrollYProgress, (value) =>
    String(Math.round(value * 100)).padStart(3, "0"),
  );

  return (
    <div
      className="fixed top-1/2 right-8 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
      aria-hidden="true"
    >
      <span className="hud-label text-foreground">{t("scroll")}</span>

      <span className="relative h-56 w-3">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong" />
        <motion.span
          className="absolute inset-x-0 top-0 mx-auto h-full w-px origin-top bg-gradient-to-b from-lavender/20 to-lavender"
          style={{ scaleY: progress }}
        />
        {/* Cursor: anel no ponto de leitura, rastro de pontos atras dele. */}
        <motion.span
          className="absolute left-0 size-3 -translate-y-1/2"
          style={{ top: knobTop }}
        >
          <motion.span
            className="absolute bottom-full left-1/2 mb-1.5 flex -translate-x-1/2 flex-col items-center gap-1.5"
            style={{ opacity: trailOpacity }}
          >
            <span className="size-1 rounded-full bg-lavender/30" />
            <span className="size-1 rounded-full bg-lavender/60" />
            <span className="size-1 rounded-full bg-lavender" />
          </motion.span>
          <span className="block size-3 rounded-full border border-lavender bg-background" />
        </motion.span>
      </span>

      <span className="flex flex-col items-center gap-2">
        <motion.span className="font-mono text-[0.65rem] tracking-[0.18em] text-lavender tabular-nums">
          {percent}
        </motion.span>
        <span className="hud-label text-muted-foreground">{t("explore")}</span>
      </span>
    </div>
  );
}
