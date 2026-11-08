"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { LocalClock } from "@/components/layout/local-clock";
import { Link } from "@/i18n/navigation";
import { cut, DURATION, LAYER_STEP, slide } from "@/lib/motion";
import { setScrollLock } from "@/lib/scroll-lock";

export type MobileNavItem = {
  key: string;
  href: string;
  label: string;
};

type MobileNavProps = {
  items: readonly MobileNavItem[];
  labels: {
    menu: string;
    close: string;
    contact: string;
    currently: string;
    location: string;
  };
};

/* Duas laminas de cor (lavanda -> violeta) correm na frente do painel, como
   no StaggeredMenu de referencia, mas com as cores do campo do hero. Este
   menu e a referencia de movimento do site: os tokens em `@/lib/motion`
   sao exatamente a gramatica dele. */
const PRE_LAYERS = ["bg-flare", "bg-violet"] as const;
const PANEL_DELAY = PRE_LAYERS.length * LAYER_STEP;
/* O rodape comeca quando o ultimo titulo ja esta subindo. */
const FOOTER_DELAY = PANEL_DELAY + 0.4;
const FOOTER_STEP = 0.08;

/**
 * Menu compacto (abaixo de `md`): painel de tela cheia que entra pela direita
 * atras de laminas escalonadas; os itens sobem girando em sequencia, com o
 * indice do console acendendo ao lado. Trava o scroll, fecha com Esc e devolve
 * o foco ao botao. Com reduced motion, abre em corte seco.
 */
export function MobileNav({ items, labels }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Sobe da mascara no degrau `step` do rodape.
  const footerRise = (step: number) => ({
    initial: { y: "120%" },
    animate: { y: "0%" },
    transition: slide({
      delay: FOOTER_DELAY + step * FOOTER_STEP,
      duration: DURATION.block,
      reduced: reducedMotion,
    }),
  });

  const close = useCallback((options?: { restoreFocus?: boolean }) => {
    // Destrava ja: o clique numa ancora precisa do Lenis livre para rolar.
    setScrollLock(false);
    setOpen(false);
    if (options?.restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    setScrollLock(true);
    firstLinkRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close({ restoreFocus: true });
    };
    // Ao cruzar para o layout desktop o painel some; o estado acompanha.
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onBreakpoint = () => {
      if (desktop.matches) close();
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      setScrollLock(false);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.menu}
        onClick={() => (open ? close() : setOpen(true))}
        className="group relative z-20 flex h-9 items-center gap-3 border border-border-strong pr-2.5 pl-3 text-foreground transition-none hover:border-lavender hover:text-lavender aria-expanded:border-lavender"
      >
        {/* Rotulo que rola MENU -> FECHAR, como um contador mecanico. */}
        <span
          aria-hidden="true"
          className="relative block h-[1em] overflow-hidden font-mono text-[0.65rem] leading-none tracking-[0.2em] uppercase"
        >
          <motion.span
            className="flex flex-col"
            animate={{ y: open ? "-50%" : "0%" }}
            transition={slide({ duration: DURATION.micro, reduced: reducedMotion })}
          >
            <span className="block h-[1em]">{labels.menu}</span>
            <span className="block h-[1em]">{labels.close}</span>
          </motion.span>
        </span>
        {/* Cruz do console: "+" que gira ate "x". */}
        <span aria-hidden="true" className="relative size-3.5">
          <motion.span
            className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current"
            animate={{ rotate: open ? 45 : 0 }}
            transition={slide({ duration: DURATION.layer, reduced: reducedMotion })}
          />
          <motion.span
            className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current"
            animate={{ rotate: open ? -45 : 90 }}
            transition={slide({ duration: DURATION.layer, reduced: reducedMotion })}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <div
            key="mobile-nav"
            className="fixed inset-0 z-10 overflow-hidden md:hidden"
          >
            {PRE_LAYERS.map((layer, index) => (
              <motion.div
                key={layer}
                aria-hidden="true"
                className={`absolute inset-0 ${layer}`}
                initial={{ x: "100%" }}
                animate={{ x: "0%" }}
                exit={{ x: "100%", transition: cut({ reduced: reducedMotion }) }}
                transition={slide({
                  delay: index * LAYER_STEP,
                  duration: DURATION.layer,
                  reduced: reducedMotion,
                })}
              />
            ))}

            <motion.nav
              id={panelId}
              aria-label={labels.menu}
              data-lenis-prevent
              className="absolute inset-0 flex flex-col overflow-y-auto bg-background px-6 pt-24 pb-8"
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%", transition: cut({ reduced: reducedMotion }) }}
              transition={slide({
                delay: PANEL_DELAY,
                duration: DURATION.panel,
                reduced: reducedMotion,
              })}
            >
              <div
                aria-hidden="true"
                className="hairline-grid pointer-events-none absolute inset-0 opacity-25"
              />

              <ol className="relative flex flex-col">
                {items.map(({ key, href, label }, index) => (
                  <li key={key} className="overflow-hidden border-b border-border">
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={href}
                      onClick={() => close()}
                      className="group flex items-start justify-between gap-6 py-3 text-foreground transition-none hover:text-lavender focus-visible:text-lavender"
                    >
                      <motion.span
                        className="display block origin-bottom-left text-[clamp(2.75rem,14vw,4.5rem)] leading-[0.92]"
                        // 150%: a mascara (<li>) inclui o py-3 do link, entao 110%
                        // deixava uma fatia do titulo visivel enquanto espera o delay.
                        initial={{ y: "150%", rotate: 6 }}
                        animate={{ y: "0%", rotate: 0 }}
                        transition={slide({
                          delay: PANEL_DELAY + 0.12 + index * 0.08,
                          duration: DURATION.display,
                          reduced: reducedMotion,
                        })}
                      >
                        {label}
                      </motion.span>
                      <motion.span
                        className="pt-2 font-mono text-[0.7rem] tracking-[0.2em] text-foreground tabular-nums group-hover:text-lavender"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={slide({
                          delay: PANEL_DELAY + 0.3 + index * 0.08,
                          duration: DURATION.label,
                          reduced: reducedMotion,
                        })}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ol>

              {/* Rodape em cascata, como a lista: rotulo, local e relogio sobem
                  de mascaras proprias; o botao de contato abre da esquerda para
                  a direita e a seta assenta por ultimo. */}
              <div className="relative mt-auto flex flex-col gap-6 pt-12">
                <div className="flex flex-col gap-2.5">
                  <span className="block overflow-hidden">
                    <motion.span
                      className="hud-label block text-foreground"
                      {...footerRise(0)}
                    >
                      {labels.currently}
                    </motion.span>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="block overflow-hidden">
                      <motion.span
                        className="block font-mono text-[0.72rem] tracking-[0.22em] text-muted-foreground uppercase"
                        {...footerRise(1)}
                      >
                        {labels.location}
                      </motion.span>
                    </span>
                    <span className="block overflow-hidden">
                      <motion.span className="block" {...footerRise(2)}>
                        <LocalClock />
                      </motion.span>
                    </span>
                  </span>
                </div>

                <motion.div
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={slide({
                    delay: FOOTER_DELAY + 3 * FOOTER_STEP,
                    duration: DURATION.panel,
                    reduced: reducedMotion,
                  })}
                >
                  <Link
                    href="/#contact"
                    onClick={() => close()}
                    className="flex h-12 items-center justify-between border border-flare px-5 font-mono text-[0.7rem] tracking-[0.22em] text-foreground uppercase transition-none hover:bg-foreground hover:text-background"
                  >
                    {labels.contact}
                    <motion.span
                      aria-hidden="true"
                      className="flex"
                      initial={{ x: -28 }}
                      animate={{ x: 0 }}
                      transition={slide({
                        delay: FOOTER_DELAY + 3 * FOOTER_STEP + 0.15,
                        duration: DURATION.block,
                        reduced: reducedMotion,
                      })}
                    >
                      <ArrowRight className="size-4" />
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
