import { parseBullets, splitLabel } from "@/lib/text";

type EntryDescriptionProps = {
  text: string;
};

/**
 * Descricao de experiencia/educacao: texto de abertura + itens em lista.
 * Em telas largas os itens se distribuem em duas colunas, usando a largura em
 * vez de empilhar um paragrafo denso. Sem itens, e so um paragrafo.
 */
export function EntryDescription({ text }: EntryDescriptionProps) {
  const { lead, items } = parseBullets(text);

  return (
    <div>
      {lead ? (
        <p className="max-w-[72ch] leading-7 text-muted-foreground">{lead}</p>
      ) : null}

      {items.length > 0 ? (
        <ul
          className={`grid gap-x-10 gap-y-4 xl:grid-cols-2 ${lead ? "mt-6" : ""}`}
        >
          {items.map((item) => {
            const { label, body } = splitLabel(item);

            return (
              <li
                key={item}
                className="relative max-w-[60ch] pl-4 text-sm leading-7 text-muted-foreground before:absolute before:top-[0.75em] before:left-0 before:size-1 before:bg-flow-light"
              >
                {label ? (
                  <span className="font-medium text-foreground">{label}: </span>
                ) : null}
                {body}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
