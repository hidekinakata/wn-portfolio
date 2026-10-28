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
 * O grid de hairlines e o mesmo em todas (regra do stud-grid). O ritmo
 * vertical e compacto de proposito: em paisagem a secao tem que caber em
 * pouco mais de uma tela, nao em duas.
 */
export function SectionShell({
  id,
  number,
  title,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-border">
      <div className="shell py-14 lg:py-20">
        <Reveal>
          <header className="flex items-baseline gap-5 border-b border-border pb-5">
            <span className="font-mono text-xs tracking-[0.22em] text-flow">
              {number}
            </span>
            <h2 className="display text-[clamp(2.25rem,4.2vw,3.5rem)] text-foreground">
              {title}
            </h2>
          </header>
        </Reveal>
        <div className="pt-8 lg:pt-10">{children}</div>
      </div>
    </section>
  );
}
