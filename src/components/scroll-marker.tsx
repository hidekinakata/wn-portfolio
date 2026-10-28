"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslations } from "next-intl";

/** Afinacao de mola compartilhada pelo cursor e pelos pontos do rastro. */
type SpringTuning = NonNullable<Parameters<typeof useSpring>[1]>;

/**
 * Mola do instrumento: stiffness baixo com massa alta dao peso sem a rigidez
 * anterior (a mola antiga era superamortecida e "arrastava dura"). O restDelta
 * e minimo porque o valor corre no dominio 0-1 do progresso de leitura.
 */
const KNOB_SPRING: SpringTuning = {
  stiffness: 180,
  damping: 22,
  mass: 0.65,
  restDelta: 0.0005,
  restSpeed: 0.01,
  skipInitialAnimation: true,
};

type TrailDotProps = {
  /** Posicao atual do cursor, em px dentro do trilho. */
  chase: MotionValue<number>;
  /** O rastro so aparece quando ha trilho percorrido acima do cursor. */
  opacity: MotionValue<number>;
  /** Distancia de repouso do ponto em relacao ao centro do cursor, em px. */
  offset: number;
  /** Classe de cor do ponto (a cabeca do rastro e a mais clara). */
  tone: string;
  spring: SpringTuning;
  reducedMotion: boolean | null;
};

/**
 * Rastro do cursor: tres pontos com folga crescente e mola cada vez mais mole.
 * Em repouso formam a pilha desenhada acima do cursor; quando a pagina corre,
 * cada ponto atrasa no seu ritmo e o rastro se estica como uma cometa.
 */
const TRAIL: readonly Pick<TrailDotProps, "offset" | "tone" | "spring">[] = [
  {
    offset: 14,
    tone: "bg-lavender",
    spring: {
      stiffness: 160,
      damping: 22,
      mass: 0.7,
      restDelta: 0.25,
      restSpeed: 2,
      skipInitialAnimation: true,
    },
  },
  {
    offset: 24,
    tone: "bg-lavender/60",
    spring: {
      stiffness: 115,
      damping: 19,
      mass: 0.8,
      restDelta: 0.25,
      restSpeed: 2,
      skipInitialAnimation: true,
    },
  },
  {
    offset: 34,
    tone: "bg-lavender/30",
    spring: {
      stiffness: 85,
      damping: 17,
      mass: 0.9,
      restDelta: 0.25,
      restSpeed: 2,
      skipInitialAnimation: true,
    },
  },
];

/**
 * Marcador SCROLL / EXPLORE do console, fixo na borda direita (o par do trilho
 * numerado a esquerda). O cursor anelado e o preenchimento do trilho seguem o
 * progresso real da leitura, com a leitura em porcentagem embaixo. Chrome
 * puro: a posicao ja e informada pelo proprio scroll, por isso `aria-hidden`.
 */
export function ScrollMarker() {
  const t = useTranslations("Hero");
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const trackRef = useRef<HTMLSpanElement>(null);
  const trackHeight = useMotionValue(0);

  // O trilho tem altura fixa em CSS (`h-56`); medimos em px para animar so
  // `transform` e recomputar no resize, sem reflow por frame.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => trackHeight.set(track.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackHeight]);

  const trackPx = () => trackHeight.get() || trackRef.current?.offsetHeight || 1;

  // Mola unica do instrumento: cursor e preenchimento andam sempre juntos.
  const smooth = useSpring(scrollYProgress, KNOB_SPRING);

  const targetY = useTransform(() => scrollYProgress.get() * trackPx());
  const knobY = useTransform(() => smooth.get() * trackPx());

  // O rastro so aparece quando ha trilho percorrido acima do cursor.
  const trailOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1]);

  // Leitura de dados: snap direto, sem tween (instrumento de sete segmentos).
  const percent = useTransform(scrollYProgress, (value) =>
    String(Math.round(value * 100)).padStart(3, "0"),
  );

  return (
    <div
      className="fixed top-1/2 right-8 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 lg:flex"
      aria-hidden="true"
    >
      <span className="hud-label text-foreground">{t("scroll")}</span>

      <span ref={trackRef} className="relative h-56 w-3">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border-strong" />
        <motion.span
          className="absolute inset-x-0 top-0 mx-auto h-full w-px origin-top bg-gradient-to-b from-lavender/20 to-lavender"
          style={{ scaleY: reducedMotion ? scrollYProgress : smooth }}
        />
        {TRAIL.map((dot) => (
          <TrailDot
            key={dot.offset}
            chase={reducedMotion ? targetY : knobY}
            opacity={trailOpacity}
            offset={dot.offset}
            tone={dot.tone}
            spring={dot.spring}
            reducedMotion={reducedMotion}
          />
        ))}
        <motion.span
          className="absolute left-0 top-0 size-3"
          style={{ y: reducedMotion ? targetY : knobY }}
        >
          <span className="block size-3 -translate-y-1/2 rounded-full border border-lavender bg-background" />
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

function TrailDot({
  chase,
  opacity,
  offset,
  tone,
  spring,
  reducedMotion,
}: TrailDotProps) {
  const target = useTransform(chase, (value) => value - offset);
  const lagged = useSpring(target, spring);

  return (
    <motion.span
      className="absolute left-0 top-0 size-3"
      style={{ y: reducedMotion ? target : lagged, opacity }}
    >
      <span
        className={`mx-auto block size-1 -translate-y-1/2 rounded-full ${tone}`}
      />
    </motion.span>
  );
}
