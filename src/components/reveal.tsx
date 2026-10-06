"use client";

import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  /** Atraso em segundos, para escalonar elementos de uma mesma secao. */
  delay?: number;
  className?: string;
};

/**
 * Envolve um bloco com fade + subida ao entrar na viewport.
 * Sem animacao quando o usuario prefere menos movimento.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
