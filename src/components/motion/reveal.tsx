"use client";

import { motion, useReducedMotion } from "motion/react";

import { DURATION, slide } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  /** Atraso em segundos, para escalonar elementos de uma mesma secao. */
  delay?: number;
  className?: string;
};

/**
 * Envolve um bloco com fade + subida ao entrar na viewport, na gramatica de
 * movimento do menu mobile (ease-out exponencial em `@/lib/motion`).
 * Sem animacao quando o usuario prefere menos movimento.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={slide({ delay, duration: DURATION.block, reduced: reducedMotion })}
    >
      {children}
    </motion.div>
  );
}
