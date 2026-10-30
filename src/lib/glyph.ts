/**
 * Glifo do artigo: um circuito de nos gerado do slug. Nao ha imagem de capa no
 * modelo; o proprio slug (estavel e unico) semeia a assinatura visual, entao o
 * mesmo artigo desenha sempre o mesmo circuito, no servidor e no cliente.
 *
 * Leitura: entrada (esquerda) -> agentes e stores -> saida (direita), como o
 * pipeline que os artigos descrevem. Os nos moram no reticulado do console
 * (`GLYPH_CELLS` x `GLYPH_CELLS`), e as arestas sao trilhas ortogonais.
 */

export type GlyphNodeKind = "input" | "agent" | "store" | "output";

export type GlyphNode = {
  x: number;
  y: number;
  kind: GlyphNodeKind;
};

export type Glyph = {
  nodes: GlyphNode[];
  /** Trilhas ortogonais (atributo `d` de path), na ordem em que se desenham. */
  edges: string[];
  /** Pontos do reticulado, para o estado apagado. */
  grid: Array<{ x: number; y: number }>;
};

export const GLYPH_VIEWBOX = 100;
export const GLYPH_CELLS = 8;

const MARGIN = 8;
const STEP = (GLYPH_VIEWBOX - MARGIN * 2) / (GLYPH_CELLS - 1);

function at(cell: number): number {
  return MARGIN + cell * STEP;
}

/** FNV-1a de 32 bits: hash barato e estavel da string. */
function hash(seed: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** mulberry32: PRNG de 32 bits, deterministico. */
function prng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Cell = { column: number; row: number };

function track(from: Cell, to: Cell, bend: number): string {
  const ax = at(from.column);
  const ay = at(from.row);
  const bx = at(to.column);
  const by = at(to.row);
  if (ay === by) return `M${ax} ${ay}H${bx}`;
  const mx = at(from.column + bend);
  return `M${ax} ${ay}H${mx}V${by}H${bx}`;
}

export function buildGlyph(seed: string): Glyph {
  const random = prng(hash(seed));
  const pick = (max: number) => Math.floor(random() * max);

  // Colunas: entrada na primeira, saida na ultima, o resto sorteado no meio.
  const inner = Array.from({ length: GLYPH_CELLS - 2 }, (_, index) => index + 1);
  for (let index = inner.length - 1; index > 0; index -= 1) {
    const swap = pick(index + 1);
    const held = inner[index] ?? 0;
    inner[index] = inner[swap] ?? 0;
    inner[swap] = held;
  }
  const middleCount = 3 + pick(4);
  const columns = [0, ...inner.slice(0, middleCount).sort((a, b) => a - b), GLYPH_CELLS - 1];

  // Linhas: nunca repete a do no anterior, para toda trilha ter cotovelo.
  const cells: Cell[] = [];
  for (const column of columns) {
    const previous = cells[cells.length - 1]?.row;
    let row = pick(GLYPH_CELLS);
    if (row === previous) row = (row + 1 + pick(GLYPH_CELLS - 1)) % GLYPH_CELLS;
    cells.push({ column, row });
  }

  const nodes: GlyphNode[] = cells.map((cell, index) => {
    const kind: GlyphNodeKind =
      index === 0
        ? "input"
        : index === cells.length - 1
          ? "output"
          : random() < 0.28
            ? "store"
            : "agent";
    return { x: at(cell.column), y: at(cell.row), kind };
  });

  const edges: string[] = [];
  cells.forEach((cell, index) => {
    const previous = cells[index - 1];
    if (!previous) return;
    const gap = cell.column - previous.column;
    edges.push(track(previous, cell, gap > 1 ? 1 + pick(gap - 1) : 0));

    // Ramificacao: de vez em quando um no tambem recebe de um anterior mais distante.
    const earlier = cells[index - 2 - pick(Math.max(1, index - 1))];
    if (index > 1 && earlier && random() < 0.5) {
      const span = cell.column - earlier.column;
      edges.push(track(earlier, cell, span > 1 ? 1 + pick(span - 1) : 0));
    }
  });

  const grid = Array.from({ length: GLYPH_CELLS * GLYPH_CELLS }, (_, index) => ({
    x: at(index % GLYPH_CELLS),
    y: at(Math.floor(index / GLYPH_CELLS)),
  }));

  return { nodes, edges, grid };
}
