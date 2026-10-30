import { highlightCode } from "@/lib/highlight";

type CodeBlockProps = {
  code: string;
  language: string;
  filename?: string;
};

/**
 * Bloco de codigo: barra com arquivo e linguagem, corpo realcado no servidor
 * (tokens viram `<span>`s, nada de HTML injetado). Rola na horizontal em vez
 * de quebrar linha - indentacao e parte da informacao.
 */
export async function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const lines = await highlightCode(code, language);

  return (
    <figure className="article-code my-10 border border-border-strong bg-card lg:-mr-16">
      <figcaption className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 font-mono text-[0.68rem] tracking-[0.18em] text-subtle-foreground uppercase">
        <span className="min-w-0 truncate text-muted-foreground">
          {filename ?? language}
        </span>
        {filename ? <span>{language}</span> : null}
      </figcaption>
      <pre
        tabIndex={0}
        className="overflow-x-auto px-4 py-5 font-mono text-[0.8125rem] leading-7"
      >
        <code>
          {lines.map((line, row) => (
            <span key={row} className="block min-h-7">
              {line.map((token, column) => (
                <span
                  key={column}
                  style={token.color ? { color: token.color } : undefined}
                >
                  {token.content}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
