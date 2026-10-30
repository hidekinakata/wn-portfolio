import { buildGlyph, GLYPH_VIEWBOX, type GlyphNode } from "@/lib/glyph";
import { LAYER_STEP } from "@/lib/motion";

type ArticleGlyphProps = {
  /** Semente do circuito: o slug do artigo. */
  seed: string;
  size: "lg" | "sm";
  /** Aceso desde o inicio. Sem isto o glifo nasce apagado e acende no hover da linha. */
  lit?: boolean;
  /** Atraso base da estreia, em segundos. */
  delay?: number;
  className?: string;
};

/** Espessuras em unidades do viewBox: o `sm` precisa de mais para ler a 5rem. */
const SPEC = {
  lg: { stroke: 0.14, node: 1.1, ring: 2.5, dot: 0.2 },
  sm: { stroke: 1.5, node: 3.4, ring: 0, dot: 0.9 },
} as const;

/**
 * Assinatura visual do artigo (ver `src/lib/glyph.ts`). Decoracao pura — o
 * equivalente em texto e o proprio artigo —, por isso `aria-hidden`. O
 * desenho (filetes que correm, nos que assentam) vem do CSS: `.glyph-boot`
 * na abertura da pagina, `[data-lit]` do `LitOnView` no indice.
 */
export function ArticleGlyph({
  seed,
  size,
  lit = false,
  delay = 0,
  className,
}: ArticleGlyphProps) {
  const spec = SPEC[size];
  const { nodes, edges, grid } = buildGlyph(seed);

  const edgeTiming = (index: number) => {
    const at = `${(delay + index * LAYER_STEP).toFixed(3)}s`;
    return { animationDelay: at, transitionDelay: at };
  };
  const nodeTiming = (index: number) => {
    const at = `${(delay + 0.16 + index * LAYER_STEP).toFixed(3)}s`;
    return { animationDelay: at, transitionDelay: at };
  };

  return (
    <svg
      viewBox={`0 0 ${GLYPH_VIEWBOX} ${GLYPH_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
      data-on={lit}
      className={`glyph ${className ?? ""}`}
    >
      <g>
        {grid.map(({ x, y }) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={spec.dot} className="glyph-dot" />
        ))}
      </g>
      <g strokeWidth={spec.stroke}>
        {edges.map((d, index) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            className="glyph-edge"
            style={edgeTiming(index)}
          />
        ))}
      </g>
      <g strokeWidth={spec.stroke}>
        {nodes.map((node, index) => (
          <g
            key={`${node.x}-${node.y}`}
            className="glyph-node"
            style={nodeTiming(index)}
          >
            <NodeShape node={node} radius={spec.node} ring={spec.ring} />
          </g>
        ))}
      </g>
    </svg>
  );
}

type NodeShapeProps = {
  node: GlyphNode;
  radius: number;
  ring: number;
};

function NodeShape({ node, radius, ring }: NodeShapeProps) {
  switch (node.kind) {
    case "store":
      return (
        <rect
          x={node.x - radius}
          y={node.y - radius}
          width={radius * 2}
          height={radius * 2}
          className="glyph-core"
        />
      );
    case "input":
      return (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius}
          className="glyph-core glyph-in"
        />
      );
    case "output":
      return (
        <>
          {ring > 0 ? (
            <circle cx={node.x} cy={node.y} r={ring} className="glyph-ring" />
          ) : null}
          <circle
            cx={node.x}
            cy={node.y}
            r={radius}
            className="glyph-core glyph-out"
          />
        </>
      );
    case "agent":
      return (
        <circle cx={node.x} cy={node.y} r={radius} className="glyph-core" />
      );
    default: {
      const _exhaustive: never = node.kind;
      return _exhaustive;
    }
  }
}
