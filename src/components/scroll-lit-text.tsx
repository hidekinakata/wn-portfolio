"use client";

import { useReducedMotion, useScroll } from "motion/react";
import { Fragment, useLayoutEffect, useRef } from "react";

type LitItem = { label: string | null; body: string };

type ScrollLitTextProps = {
  /** Frase de abertura, em corpo grande. */
  lead: string;
  /** Detalhes em lista, com o rotulo destacado como na experiencia. */
  items: readonly LitItem[];
  className?: string;
};

/** Palavras como `<span>` acendiveis; os espacos ficam como texto real. */
function LitWords({ text }: { text: string }) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => (
      <Fragment key={index}>
        <span data-word="" className="lit-word">
          {word}
        </span>{" "}
      </Fragment>
    ));
}

type WordState = "lit" | "unlit" | "edge";

/** Linha de leitura: fracao da altura da viewport abaixo da qual ainda e escuro. */
const READING_LINE = 0.62;

/** Estado de cada palavra dado quantas ja estao acesas. */
function wordState({
  index,
  litCount,
  total,
}: {
  index: number;
  litCount: number;
  total: number;
}): WordState {
  if (index >= litCount) return "unlit";
  // A ultima palavra acesa carrega o cursor, exceto quando o texto fechou.
  if (index === litCount - 1 && litCount < total) return "edge";
  return "lit";
}

/**
 * Quantas palavras ja cruzaram a linha de leitura. As palavras estao em ordem
 * de documento, entao a contagem e monotonica e o laco para na primeira
 * apagada. O topo de cada palavra ganha um desvio proporcional a sua posicao
 * horizontal (no maximo uma altura de palavra, menor que o entrelinha): a luz
 * varre cada linha da esquerda para a direita em vez de acender a linha toda.
 */
function countLit({
  root,
  words,
}: {
  root: HTMLElement;
  words: readonly HTMLElement[];
}) {
  const line = window.innerHeight * READING_LINE;
  const rootRect = root.getBoundingClientRect();

  if (rootRect.bottom < line) return words.length;
  if (rootRect.top > line) return 0;

  let count = 0;
  for (const word of words) {
    const rect = word.getBoundingClientRect();
    const sweep = ((rect.left - rootRect.left) / rootRect.width) * rect.height;
    if (rect.top + sweep >= line) break;
    count += 1;
  }
  return count;
}

/**
 * Repinta so o intervalo que mudou entre `previous` e `next` (mais uma palavra
 * de folga para o cursor). `previous = -1` pinta tudo.
 */
function paintWords({
  words,
  previous,
  next,
}: {
  words: readonly HTMLElement[];
  previous: number;
  next: number;
}) {
  const total = words.length;
  const from = previous < 0 ? 0 : Math.max(Math.min(previous, next) - 2, 0);
  const to = previous < 0 ? total : Math.min(Math.max(previous, next) + 1, total);

  for (let index = from; index < to; index += 1) {
    const word = words[index];
    if (word) word.dataset.lit = wordState({ index, litCount: next, total });
  }
}

/**
 * Texto que acende palavra por palavra conforme a leitura avanca na tela,
 * como um console ligando. O texto continua sendo texto real (selecionavel,
 * lido por leitor de tela, completo sem JS): so a cor de cada palavra muda,
 * assentando em ease-out. Sem animacao com `prefers-reduced-motion`.
 */
export function ScrollLitText({ lead, items, className }: ScrollLitTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    let lit = -1;

    const sync = () => {
      const next = countLit({ root, words });
      if (next === lit) return;
      paintWords({ words, previous: lit, next });
      lit = next;
    };

    sync();
    const unsubscribe = scrollY.on("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", sync);
      for (const word of words) delete word.dataset.lit;
    };
  }, [reducedMotion, scrollY]);

  return (
    <div ref={rootRef} className={className}>
      <p className="max-w-[40ch] text-[clamp(1.4rem,2.5vw,2.25rem)] leading-[1.3] tracking-[-0.012em] text-pretty text-foreground">
        <LitWords text={lead} />
      </p>

      {items.length > 0 ? (
        <ul className="mt-8 flex max-w-[62ch] flex-col gap-3.5 text-muted-foreground">
          {items.map((item) => (
            <li
              key={item.body}
              className="relative pl-4 leading-7 before:absolute before:top-[0.72em] before:left-0 before:size-1 before:bg-flow-light"
            >
              {item.label ? (
                <span className="font-medium text-foreground">
                  <LitWords text={`${item.label}:`} />
                </span>
              ) : null}
              <LitWords text={item.body} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
