import { z } from "zod";

const text = z.string().min(1);

/** Blocos tipados do artigo: o corpo e renderizado sem HTML cru. */
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text }),
  z.object({ type: z.literal("paragraph"), text, id: z.string().optional() }),
  z.object({
    type: z.literal("code"),
    code: z.string(),
    language: z.string().default("text"),
    filename: z.string().optional(),
  }),
  z.object({
    type: z.literal("quote"),
    text,
    author: z.string().optional(),
    year: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(text).min(1),
  }),
  z.object({
    type: z.literal("image"),
    src: z.url(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
  z.object({
    type: z.literal("callout"),
    text,
    title: z.string().optional(),
  }),
]);

export type ArticleBlock = z.output<typeof blockSchema>;

const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  number: z.string().optional(),
  blocks: z.array(z.unknown()),
});

export type ArticleSection = {
  id: string;
  title: string;
  number: string;
  blocks: ArticleBlock[];
};

/**
 * `sections` e JSON livre no banco: valida na borda e descarta o que nao for
 * um bloco conhecido, em vez de derrubar o artigo inteiro. Secoes sem numero
 * ganham a posicao (`01`, `02`...).
 */
export function parseSections(value: unknown): ArticleSection[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry: unknown, index) => {
    const section = sectionSchema.safeParse(entry);
    if (!section.success) return [];

    const blocks = section.data.blocks.flatMap((raw) => {
      const block = blockSchema.safeParse(raw);
      return block.success ? [block.data] : [];
    });

    return [
      {
        id: section.data.id,
        title: section.data.title,
        number: section.data.number ?? String(index + 1).padStart(2, "0"),
        blocks,
      },
    ];
  });
}
