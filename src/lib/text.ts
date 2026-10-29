/** Marcador de item: "- ", "* " ou "• " no inicio ou depois de um espaco. */
const BULLET_MARKER = /(?:^|\s+)[-*•]\s+/;
const LEADING_BULLET = /^\s*[-*•]\s+/;

export type BulletedText = {
  /** Texto corrido antes do primeiro item (ou o texto inteiro, sem itens). */
  lead: string | null;
  items: readonly string[];
};

/**
 * Descricoes vindas do banco trazem itens inline ("Entregas: - A - B - C").
 * Separa o texto corrido dos itens para a UI poder renderizar uma lista real;
 * sem marcadores, devolve so o texto como `lead`. Hifens dentro de palavras
 * ("end-to-end") nao contam: o marcador precisa de espaco dos dois lados.
 */
export function parseBullets(text: string): BulletedText {
  const trimmed = text.trim();
  if (!BULLET_MARKER.test(trimmed)) {
    return { lead: trimmed || null, items: [] };
  }

  const parts = trimmed
    .split(BULLET_MARKER)
    .map((part) => part.trim())
    .filter(Boolean);

  if (LEADING_BULLET.test(trimmed)) return { lead: null, items: parts };

  const [lead, ...items] = parts;
  return { lead: lead ?? null, items };
}

/** Emoji no inicio do texto (com seletores de variacao e juncoes), mais o espaco. */
const LEADING_PICTOGRAPH = /^(?:\p{Extended_Pictographic}[️‍]*)+\s*/u;

/**
 * Textos do banco usam emoji como marcador de item ("🚀 Backend: ...").
 * A UI desenha o proprio marcador, entao o emoji sai.
 */
export function stripLeadingPictograph(text: string): string {
  return text.replace(LEADING_PICTOGRAPH, "");
}

/**
 * Separa o rotulo curto antes de ":" ("AI Engineering: Led ...") do resto,
 * para destacar o rotulo. Sem rotulo curto e sem ponto, devolve tudo no corpo.
 */
export function splitLabel(item: string): { label: string | null; body: string } {
  const colon = item.indexOf(": ");
  if (colon < 3 || colon > 52) return { label: null, body: item };

  const label = item.slice(0, colon);
  if (label.includes(".")) return { label: null, body: item };

  return { label, body: item.slice(colon + 2) };
}
