/**
 * Camada de campo do hero. Os componentes enviados pelo usuario (que substituem
 * a imagem de fundo) entram por `children`; enquanto nao chegam, um campo
 * contido em CSS segura a composicao. Pura decoracao de atmosfera — a
 * equivalente em texto e o conteudo real do hero, por isso `aria-hidden`.
 */
type HeroFieldProps = {
  children?: React.ReactNode;
};

export function HeroField({ children }: HeroFieldProps) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {children ?? <FieldStandIn />}
    </div>
  );
}

function FieldStandIn() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(115%_85%_at_72%_18%,rgba(91,124,250,0.20),transparent_58%),radial-gradient(85%_65%_at_88%_88%,rgba(255,122,47,0.13),transparent_52%)]" />
      <div className="hairline-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </>
  );
}
