"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type FieldLayer = {
  DotField: typeof import("@/components/DotField").default;
};

/**
 * Campo do hero: fundo estatico e reticula de particulas do `DotField`.
 * A mascara guarda a coluna de texto escura. Pura atmosfera — o equivalente
 * em texto e o proprio hero, por isso `aria-hidden`.
 */
export function HeroField() {
  const reducedMotion = useReducedMotion() ?? false;
  const [layer, setLayer] = useState<FieldLayer | null>(null);

  /* O canvas fica fora do bundle inicial e do SSR: o texto do hero pinta
     primeiro. Os dots so entram depois de carregados, e a
     estreia (`hero-field-fade`) nasce junto com eles — assim o campo nunca
     aparece ja na metade do fade. */
  useEffect(() => {
    let alive = true;
    void import("@/components/DotField").then((dots) => {
      if (alive) {
        setLayer({ DotField: dots.default });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_78%_30%,rgba(123,108,255,0.16),transparent_60%),radial-gradient(60%_50%_at_92%_82%,rgba(255,122,47,0.10),transparent_60%)]" />

      {layer ? <HeroDots layer={layer} reducedMotion={reducedMotion} /> : null}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

type HeroDotsProps = {
  layer: FieldLayer;
  reducedMotion: boolean;
};

function HeroDots({
  layer: { DotField },
  reducedMotion,
}: HeroDotsProps) {
  return (
    <div className="hero-dots-mask hero-field-fade absolute inset-0">
      <DotField
        dotRadius={1.5}
        dotSpacing={10}
        bulgeStrength={reducedMotion ? 0 : 67}
        glowRadius={1}
        sparkle={true}
        waveAmplitude={0.2}
        cursorRadius={50}
        cursorForce={0.11}
        returnSpeed={0.3}
        bulgeOnly
        gradientFrom="#7b6cff"
        gradientTo="#b9b4ff"
        glowColor="#0b0f1a"
      />
    </div>
  );
}
