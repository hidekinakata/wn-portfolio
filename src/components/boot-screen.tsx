"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { BrandCurtain, CURTAIN_MS } from "@/components/brand-curtain";
import { BrandLockup } from "@/components/brand-lockup";
import { BOOT_STORAGE_KEY } from "@/lib/boot";
import { DURATION, leave, slide } from "@/lib/motion";

type BootScreenProps = {
  /** Funcoes sob o nome: "AI Automation Engineer & Full Stack Developer". */
  role: string;
};

/** Pecas do lockup: 0 marca, 1 divisoria, 2 nome, 3 cargo. */
const LAST_ITEM = 3;
/** Entrada das pecas: logo, nome e por fim o cargo, como os itens do menu. */
const ENTER_DELAY = 0.15;
const ENTER_STEP = 0.1;
const ENTER_MS = (ENTER_DELAY + LAST_ITEM * ENTER_STEP + DURATION.block) * 1000;
/** Respiro com a marca completa antes de tudo sumir. */
const REST_MS = 350;
/** Saida das pecas, escalonada; so depois a tela escura sai. */
const LEAVE_STEP = 0.07;
const ITEMS_OUT_MS = (LAST_ITEM * LEAVE_STEP + DURATION.layer) * 1000;
/** Troca de idioma: a cortina ja cobriu a pagina anterior, sai quase direto. */
const SWITCH_HOLD_MS = 150;

type Stage = "enter" | "items-out" | "curtain-out";

/**
 * Abertura da marca. Primeira visita de cada sessao, marcada pelo script
 * inline de `src/lib/boot.ts` com `data-boot="on"` no `<html>` — sem esse
 * atributo o overlay fica `display: none`. Coreografia: a tela escura e a
 * primeira coisa que aparece; logo, nome e cargo entram em sequencia; tudo
 * some; so entao a cortina do menu mobile varre para a esquerda e o hero
 * estreia (pausado via CSS ate la). Na troca de idioma as pecas ja ficam no
 * lugar (ver `globals.css`) e so a cortina sai. Com `prefers-reduced-motion`
 * nada roda.
 */
export function BootScreen({ role }: BootScreenProps) {
  const [stage, setStage] = useState<Stage>("enter");
  const finishedRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      try {
        sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
      } catch {
        // Sem sessionStorage a abertura nao teria rodado de qualquer forma.
      }
      // Devolve a estreia do hero (as animacoes pausadas correm do zero).
      document.documentElement.dataset.boot = "off";
    };

    if (document.documentElement.dataset.boot !== "on") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const isSwitch = document.documentElement.dataset.bootKind === "switch";

    const itemsOutAt = isSwitch ? SWITCH_HOLD_MS : ENTER_MS + REST_MS;
    const curtainAt = itemsOutAt + (isSwitch ? 0 : ITEMS_OUT_MS);
    const timers = [
      window.setTimeout(() => setStage("items-out"), itemsOutAt),
      window.setTimeout(() => setStage("curtain-out"), curtainAt),
      window.setTimeout(finish, curtainAt + CURTAIN_MS),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const entered = stage === "enter";

  // Como os itens do menu mobile: sobem de dentro de uma mascara girando de
  // leve, em sequencia; a saida e o gesto contrario.
  const item = (index: number, node: ReactNode): ReactNode => {
    // A divisoria tem 1px: entra e sai crescendo/encolhendo, nao subindo.
    const isRule = index === 1;
    const hidden = isRule
      ? { y: "0%", rotate: 0, scale: 0 }
      : { y: "115%", rotate: 6, scale: 1 };
    const gone = isRule
      ? { y: "0%", rotate: 0, scale: 0 }
      : { y: "-115%", rotate: -4, scale: 1 };

    return (
      <span
        className="block overflow-hidden"
        data-brand-role={index === LAST_ITEM ? "" : undefined}
      >
        <motion.span
          data-brand-item=""
          className="block origin-top-left"
          initial={hidden}
          animate={entered ? { y: "0%", rotate: 0, scale: 1 } : gone}
          transition={
            entered
              ? slide({
                  delay: ENTER_DELAY + index * ENTER_STEP,
                  duration: DURATION.block,
                })
              : leave({ delay: index * LEAVE_STEP, duration: DURATION.layer })
          }
        >
          {node}
        </motion.span>
      </span>
    );
  };

  return (
    <div
      id="boot-screen"
      aria-hidden="true"
      className="fixed inset-0 z-[60] overflow-hidden"
    >
      <BrandCurtain
        phase={stage === "curtain-out" ? "out" : "in"}
        entrance={false}
      >
        <BrandLockup role={role} item={item} />
      </BrandCurtain>
    </div>
  );
}
