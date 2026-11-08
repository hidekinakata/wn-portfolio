"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { DURATION, LAYER_STEP, leave, slide } from "@/lib/motion";

/* Mesma cortina do menu mobile: lavanda -> violeta correm na frente e o
   painel de fundo chega por ultimo. */
const BLADES = ["bg-flare", "bg-violet"] as const;
const LAYERS = BLADES.length + 1;

export type CurtainPhase = "in" | "out";

/** Tempo ate a cortina cobrir a tela (ou sair) por completo. */
export const CURTAIN_MS = ((LAYERS - 1) * LAYER_STEP + DURATION.layer) * 1000;

type BrandCurtainProps = {
  phase: CurtainPhase;
  /**
   * Com `entrance={false}` a cortina ja nasce fechada (abertura: a tela e a
   * primeira coisa que aparece) e so anima a saida.
   */
  entrance?: boolean;
  /** Atraso (s) so da saida, para o conteudo sair antes da cortina. */
  exitDelay?: number;
  children: ReactNode;
};

/**
 * Entrada: lavanda, violeta e painel varrem da direita, escalonados. Saida: o
 * lado oposto (esquerda), painel primeiro e lavanda por ultimo. O pai fornece
 * o contenedor `fixed`.
 */
export function BrandCurtain({
  phase,
  entrance = true,
  exitDelay = 0,
  children,
}: BrandCurtainProps) {
  const entering = phase === "in";
  const initialX = entrance ? "100%" : "0%";
  const targetX = entering ? "0%" : "-100%";
  // Indice 0 = lamina lavanda; o painel e o ultimo indice.
  const transition = (index: number) =>
    entering
      ? slide({ delay: index * LAYER_STEP, duration: DURATION.layer })
      : leave({
          delay: exitDelay + (LAYERS - 1 - index) * LAYER_STEP,
          duration: DURATION.layer,
        });

  return (
    <>
      {BLADES.map((color, index) => (
        <motion.div
          key={color}
          className={`absolute inset-0 ${color}`}
          initial={{ x: initialX }}
          animate={{ x: targetX }}
          transition={transition(index)}
        />
      ))}

      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-background px-6"
        initial={{ x: initialX }}
        animate={{ x: targetX }}
        transition={transition(BLADES.length)}
      >
        {children}
      </motion.div>
    </>
  );
}
