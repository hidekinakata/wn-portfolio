import type { ReactNode } from "react";

type BrandLockupProps = {
  /** Linha de funcoes sob o nome (so na abertura). */
  role?: ReactNode;
  /**
   * Envolve cada peca (0 marca, 1 divisoria, 2 nome, 3 cargo) para quem a
   * renderiza animar. Sem ele o lockup e estatico.
   */
  item?: (index: number, node: ReactNode) => ReactNode;
};

const plain = (_index: number, node: ReactNode) => node;

/**
 * A marca do header em escala de palco: `WN | WILLIAM NAKATA`, mesmo mono
 * leve e tracking, hairline no meio. O movimento fica por conta da cortina
 * que a carrega (`brand-curtain.tsx`) e do `item` de quem a usa.
 */
export function BrandLockup({ role, item = plain }: BrandLockupProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-7 sm:text-left">
      {item(
        0,
        <span className="block font-mono text-5xl font-light tracking-[0.12em] text-foreground sm:text-7xl">
          WN
        </span>,
      )}
      {item(
        1,
        <span
          aria-hidden="true"
          className="block h-px w-14 bg-border-strong sm:h-16 sm:w-px"
        />,
      )}
      <div className="flex flex-col items-center gap-2.5 sm:items-start">
        {item(
          2,
          <span className="block font-mono text-[0.72rem] font-medium tracking-[0.26em] whitespace-nowrap text-foreground uppercase sm:text-sm">
            William Nakata
          </span>,
        )}
        {role
          ? item(
              3,
              <span className="hud-label block max-w-[15rem] text-balance sm:max-w-none">
                {role}
              </span>,
            )
          : null}
      </div>
    </div>
  );
}
