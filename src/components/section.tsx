import { LitOnView } from "@/components/lit-on-view";
import { MaskedText } from "@/components/masked-text";
import { CHAR_STEP } from "@/lib/motion";

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
 * pouco mais de uma tela, nao em duas. O cabecalho liga ao entrar na tela:
 * numero assenta, o titulo sobe letra a letra de dentro da mascara (o gesto
 * do nome no hero) e o filete corre aceso em lavanda, esfriando para hairline.
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
        <LitOnView>
          <header className="relative flex items-baseline gap-5 pb-5">
            <span className="sec-num font-mono text-xs tracking-[0.22em] text-flow">
              {number}
            </span>
            <h2 className="display text-[clamp(2.25rem,4.2vw,3.5rem)] text-foreground">
              <MaskedText
                text={title}
                split="char"
                pieceClassName="sec-char"
                delay={0.14}
                step={CHAR_STEP}
                timing="transition"
              />
            </h2>
            <span
              aria-hidden="true"
              className="sec-rule absolute inset-x-0 bottom-0 h-px"
            />
          </header>
        </LitOnView>
        <div className="pt-8 lg:pt-10">{children}</div>
      </div>
    </section>
  );
}
