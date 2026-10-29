/**
 * Padrao de movimento do console — fonte unica de verdade.
 *
 * A referencia de qualidade e tipo das animacoes deste site e o menu mobile
 * (`src/components/navigation/mobile-nav.tsx`): entradas em ease-out exponencial com
 * atrasos escalonados, laminas de cor empilhadas com `LAYER_STEP`, saidas em
 * corte curto ease-in, uma unica natureza suave (tudo assenta em ease-out,
 * sem piscar) e hover em corte seco (`transition-none`), sem fade. `prefers-reduced-motion` vira corte
 * instantaneo (duracao zero) ou simplesmente nao anima.
 *
 * Todo componente animado (Motion ou CSS) consome estes tokens — nunca declara
 * easing, duracao ou stagger proprios. Ver AGENTS.md, secao "Motion".
 */
import type { Transition } from "motion/react";

/** Entrada: expo ease-out. */
export const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

/** Saida: expo ease-in, curta e seca. */
export const EASE_IN: Transition["ease"] = [0.7, 0, 0.84, 0];

/** As mesmas curvas para `@keyframes` e estilos inline em CSS. */
export const EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_IN_CSS = "cubic-bezier(0.7, 0, 0.84, 0)";

/** Escalonamento entre laminas/blocos, em segundos. */
export const LAYER_STEP = 0.07;

/** Escalonamento entre letras que sobem da mascara (nome, titulos). */
export const CHAR_STEP = 0.028;

export const DURATION = {
  /** Corte de saida (tambem o corte seco de hover). */
  cut: 0.32,
  /** Micro-controle (rotulo que rola no botao do menu). */
  micro: 0.45,
  /** Lamina de cor correndo. */
  layer: 0.5,
  /** Painel grande (menu mobile). */
  panel: 0.65,
  /** Tipo display subindo no lugar. */
  display: 0.9,
  /** Bloco de conteudo assentando (reveals de secao). */
  block: 0.55,
  /** Rotulo pequeno / numero de indice. */
  label: 0.4,
} as const;

type SlideOptions = {
  /** Atraso em segundos (ja escalonado pelo chamador). */
  delay?: number;
  duration?: number;
  /** Com `prefers-reduced-motion`, vira corte instantaneo. */
  reduced?: boolean;
};

/** Entrada escalonada: ease-out com atraso. */
export function slide({
  delay = 0,
  duration = DURATION.layer,
  reduced = false,
}: SlideOptions = {}): Transition {
  return reduced ? { duration: 0 } : { duration, delay, ease: EASE_OUT };
}

/** Retirada de laminas: o inverso da entrada, simetrico e sem tranco. */
export const EASE_IN_OUT: Transition["ease"] = [0.76, 0, 0.24, 1];

/** Saida em contra-movimento da entrada: mesma duracao de lamina. */
export function leave({
  delay = 0,
  duration = DURATION.layer,
  reduced = false,
}: SlideOptions = {}): Transition {
  return reduced ? { duration: 0 } : { duration, delay, ease: EASE_IN_OUT };
}

type CutOptions = {
  /** Com `prefers-reduced-motion`, vira corte instantaneo. */
  reduced?: boolean;
};

/** Saida: corte ease-in curto. */
export function cut({ reduced = false }: CutOptions = {}): Transition {
  return reduced ? { duration: 0 } : { duration: DURATION.cut, ease: EASE_IN };
}

/**
 * Duracao total de uma sequencia em laminas (a ultima lamina a nascer fecha a
 * cobertura). `layers` conta as laminas; `duration` e a de cada uma.
 */
export function layerSpan(layers: number, duration: number): number {
  return (layers - 1) * LAYER_STEP + duration;
}
