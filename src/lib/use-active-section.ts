import { useEffect, useState } from "react";

/** Linha de leitura: fracao da viewport a partir da qual a secao conta como atual. */
const READING_LINE = 0.35;

/**
 * Id da secao atual: a ultima, em ordem de documento, cujo topo ja cruzou a
 * linha de leitura (ou `null` antes da primeira). Mede a cada scroll em vez de
 * observar elementos no mount: as secoes do banco chegam por streaming, depois
 * da hidratacao, e um observer armado cedo nunca as veria. Desligado com
 * `enabled = false` (paginas sem as secoes da landing).
 */
export function useActiveSection({
  ids,
  enabled = true,
}: {
  ids: readonly string[];
  enabled?: boolean;
}): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) {
          current = id;
        }
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids, enabled]);

  return activeId;
}
