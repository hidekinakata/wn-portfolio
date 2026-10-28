"use client";

import { useLayoutEffect, useRef } from "react";

type LitOnViewProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Painel que "acende" ao entrar na viewport. O markup do servidor ja nasce no
 * estado aceso (sem JS ou com `prefers-reduced-motion` nada muda); so depois
 * do primeiro layout o painel e armado (`data-lit="armed"`, apagado) e, ao
 * cruzar a viewport, passa a `data-lit="on"`. As regras `.lit-*` do CSS fazem
 * o resto, por filho, com atraso proprio.
 *
 * O atributo e escrito direto no DOM de proposito: nao e estado de render, e
 * trocar por `useState` re-renderizaria a subarvore inteira por um flag visual.
 */
export function LitOnView({ children, className }: LitOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.dataset.lit = "armed";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.dataset.lit = "on";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      delete element.dataset.lit;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
