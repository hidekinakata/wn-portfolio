"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

/* WebGL (three) e canvas ficam fora do bundle inicial e do SSR: o texto do
   hero pinta primeiro, o campo entra por cima do fundo estatico. */
const ColorBends = dynamic(() => import("@/components/ColorBends"), {
  ssr: false,
});
const DotField = dynamic(() => import("@/components/DotField"), {
  ssr: false,
});

const BEND_COLORS = ["#ff5c7a", "#8a5cff", "#00ffd1"];

/**
 * Campo do hero, em tres camadas: o fundo estatico (tambem o fallback sem
 * WebGL), o `ColorBends` como fluxo de cor e o `DotField` como reticula de
 * particulas na frente. Mascaras guardam a coluna de texto escura, como na
 * referencia. Pura atmosfera — o equivalente em texto e o proprio hero, por
 * isso `aria-hidden`.
 */
export function HeroField() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_78%_30%,rgba(138,92,255,0.16),transparent_60%),radial-gradient(60%_50%_at_92%_82%,rgba(255,92,122,0.10),transparent_60%)]" />

      <div className="hero-field-mask hero-field-fade absolute inset-0">
        <ColorBends
          colors={BEND_COLORS}
          rotation={90}
          speed={reducedMotion ? 0 : 0.2}
          scale={1}
          frequency={1.7}
          warpStrength={1}
          mouseInfluence={reducedMotion ? 0 : 1}
          noise={reducedMotion ? 0 : 0.15}
          parallax={reducedMotion ? 0 : 0.5}
          iterations={3}
          intensity={1.5}
          bandWidth={6}
          transparent
          autoRotate={0}
          tilt={!reducedMotion}
        />
      </div>

      <div className="hero-dots-mask hero-field-fade absolute inset-0">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={reducedMotion ? 0 : 67}
          glowRadius={160}
          sparkle={false}
          waveAmplitude={0}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#A855F7"
          gradientTo="#B497CF"
          glowColor="#120F17"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
