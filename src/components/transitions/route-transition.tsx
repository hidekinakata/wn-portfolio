"use client";

import { useReducedMotion } from "motion/react";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  BrandCurtain,
  CURTAIN_MS,
  type CurtainPhase,
} from "@/components/transitions/brand-curtain";
import { BrandLockup } from "@/components/transitions/brand-lockup";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SWITCH_STORAGE_KEY } from "@/lib/boot";

type Phase = CurtainPhase;

type Wipe = {
  phase: Phase;
  /** Reinicio limpo: uma chave nova remonta a cortina em x: 100%. */
  key: number;
};

const IN_MS = CURTAIN_MS;
const OUT_MS = CURTAIN_MS;
/** Tempo maximo em cobertura esperando o commit da navegacao. */
const HOLD_LIMIT_MS = 1200;

/**
 * Tela de transicao entre rotas. No clique de um link interno a cortina do
 * menu mobile (lavanda, violeta, painel com a marca WN | William Nakata) entra
 * pela direita e fica fechada ate o commit da navegacao; entao sai pelo lado
 * oposto (esquerda), revelando a pagina nova. Back/forward (sem clique) roda a coreografia completa. Ancoras da
 * mesma rota, `/admin` e links externos nao recebem wipe. Com
 * `prefers-reduced-motion`, nada renderiza.
 */
export function RouteTransition() {
  const pathname = usePathname();
  // `usePathname` do next-intl vem sem o prefixo de locale: a troca de idioma
  // so aparece aqui pelo `locale`.
  const locale = useLocale();
  const reducedMotion = useReducedMotion() ?? false;

  const [wipe, setWipe] = useState<Wipe | null>(null);
  const phaseRef = useRef<Phase | null>(null);
  const coveredRef = useRef(false);
  const committedRef = useRef(false);
  const keyRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  // Guarda o valor anterior em ref: sobrevive a dupla invocacao de efeitos do
  // StrictMode (o `firstRenderRef` simplesmente seria consumido na primeira).
  const prevRef = useRef({ pathname, locale });

  const clearTimer = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  const reveal = useCallback(() => {
    if (phaseRef.current !== "in") return;
    clearTimer();
    phaseRef.current = "out";
    setWipe((current) => (current ? { ...current, phase: "out" } : current));
    timerRef.current = window.setTimeout(() => {
      phaseRef.current = null;
      coveredRef.current = false;
      setWipe(null);
    }, OUT_MS);
  }, []);

  const cover = useCallback(
    () => {
      clearTimer();
      keyRef.current += 1;
      coveredRef.current = false;
      committedRef.current = false;
      phaseRef.current = "in";
      setWipe({ phase: "in", key: keyRef.current });
      timerRef.current = window.setTimeout(() => {
        coveredRef.current = true;
        if (committedRef.current) {
          reveal();
        } else {
          // A navegacao nao comitou (falhou ou e a mesma rota): destrava.
          timerRef.current = window.setTimeout(reveal, HOLD_LIMIT_MS);
        }
      }, IN_MS);
    },
    [reveal],
  );

  // Commit da navegacao: revela se a cobertura ja fechou; senao, o timer de
  // cobertura cuida disso. Sem wipe em andamento (back/forward), roda tudo.
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { pathname, locale };
    if (prev.pathname === pathname && prev.locale === locale) return;
    committedRef.current = true;
    if (phaseRef.current === "in") {
      if (coveredRef.current) reveal();
    } else if (phaseRef.current === null && !reducedMotion) {
      cover();
    }
  }, [pathname, locale, cover, reveal, reducedMotion]);

  // Clique em link interno: comeca a cobertura antes do commit (o clique segue
  // normalmente — nada e interceptado, a navegacao nao atrasa).
  useEffect(() => {
    if (reducedMotion) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.nowipe !== undefined) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Ancoras da mesma rota rolam, nao transicionam.
      if (url.pathname === window.location.pathname) return;
      // O admin e superficie de operacao: sem coreografia de palco.
      if (url.pathname.startsWith("/admin")) return;

      // Troca de idioma: o layout raiz muda com o locale e o Next faz carga
      // completa, que destruiria a cortina no meio. Fecha a cortina, deixa o
      // recado para a pagina nova (que ja chega coberta, ver `boot.ts`) e so
      // entao navega.
      const nextLocale = routing.locales.find(
        (value) =>
          url.pathname === `/${value}` || url.pathname.startsWith(`/${value}/`),
      );
      if (nextLocale && nextLocale !== locale) {
        event.preventDefault();
        try {
          sessionStorage.setItem(SWITCH_STORAGE_KEY, "1");
        } catch {
          // Sem sessionStorage a pagina nova so chega sem cortina.
        }
        cover();
        window.setTimeout(() => window.location.assign(url.href), IN_MS);
        return;
      }

      cover();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [cover, reducedMotion, locale]);

  useEffect(() => () => clearTimer(), []);

  if (reducedMotion || !wipe) return null;

  return (
    <div
      key={wipe.key}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      <BrandCurtain phase={wipe.phase}>
        <BrandLockup />
      </BrandCurtain>
    </div>
  );
}
