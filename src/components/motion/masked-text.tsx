type MaskedTextProps = {
  text: string;
  /** Unidade que sobe da mascara: letra (nome, titulos) ou palavra (frases). */
  split: "char" | "word";
  /** Classe de cada peca: define o gatilho (keyframe do hero ou `LitOnView`). */
  pieceClassName: string;
  /** Inicio da sequencia, em segundos. */
  delay?: number;
  /** Escalonamento entre pecas, em segundos (tokens de `@/lib/motion`). */
  step: number;
  /** Se o atraso vai para a animacao (CSS keyframe) ou para a transicao. */
  timing: "animation" | "transition";
};

/**
 * Texto que sobe de dentro de uma mascara girando de leve, peca por peca — o
 * gesto dos itens do menu mobile e do lockup da abertura. As pecas sao o
 * proprio texto (sem copia escondida): o `textContent` continua identico a
 * frase, para busca, leitores de tela e copiar/colar. Cada palavra e a sua
 * propria mascara, entao a quebra de linha continua natural.
 */
export function MaskedText({
  text,
  split,
  pieceClassName,
  delay = 0,
  step,
  timing,
}: MaskedTextProps) {
  // Palavras ja partidas em pecas; `first` e o indice global da primeira peca
  // de cada palavra, para o escalonamento correr pela frase inteira.
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => (split === "char" ? Array.from(word) : [word]));
  const firsts = words.map((_, wordIndex) =>
    words.slice(0, wordIndex).reduce((sum, pieces) => sum + pieces.length, 0)
  );

  const styleAt = (index: number) => {
    const at = `${(delay + index * step).toFixed(3)}s`;
    return timing === "animation"
      ? { animationDelay: at }
      : { transitionDelay: at };
  };

  return (
    <>
      {words.map((pieces, wordIndex) => (
        <span key={wordIndex}>
          {wordIndex > 0 ? " " : null}
          <span className="mask-line">
            {pieces.map((content, pieceIndex) => (
              <span
                key={pieceIndex}
                className={pieceClassName}
                style={styleAt((firsts[wordIndex] ?? 0) + pieceIndex)}
              >
                {content}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}
