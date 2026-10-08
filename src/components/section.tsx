import { Reveal } from "@/components/reveal";

type SectionShellProps = {
  /** Ancora da secao (rail numerado referencia o mesmo id). */
  id: string;
  /** Numero do console — o indice do rail, informacao real de posicao. */
  number: string;
  title: string;
  children: React.ReactNode;
};

/**
 * Casca das secoes da landing: cabecalho numerado + area de conteudo.
 * O grid de hairlines e o mesmo em todas (regra do stud-grid).
 */
export function SectionShell({
  id,
  number,
  title,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border">
      <div className="shell py-24 lg:py-32">
        <Reveal>
          <header className="flex items-baseline gap-5 border-b border-border pb-6">
            <span className="font-mono text-xs tracking-[0.22em] text-flow">
              {number}
            </span>
            <h2 className="display text-[clamp(2.25rem,5vw,4.25rem)] text-foreground">
              {title}
            </h2>
          </header>
        </Reveal>
        <div className="pt-12 lg:pt-16">{children}</div>
      </div>
    </section>
  );
}
