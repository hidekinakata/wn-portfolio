import { z } from "zod";
import { blockSchema } from "@/lib/article-content";
import type { ValidationIssue } from "@/lib/admin/validation";

export const contentKindSchema = z.enum(["profile", "experience", "education", "certification", "language", "project", "article"]);
export const contentKinds = contentKindSchema.options;
export type ContentKind = z.infer<typeof contentKindSchema>;

const text = z.string().trim().min(1).max(500);
const optionalText = z.string().trim().max(30000).default("");
const url = z.union([z.literal(""), z.url().refine((value) => /^https?:\/\//.test(value))], { error: "url" }).default("");
const date = z.iso.date({ error: "date" }).transform((value) => new Date(`${value}T00:00:00.000Z`));
const optionalDate = z.union([z.literal("").transform(() => null), date]);
const checkbox = z.preprocess((value) => value === "on" || value === true, z.boolean());
const order = z.coerce.number().int().min(0).max(10000).default(0);
const base = { id: z.string().max(100), version: z.union([z.literal(""), z.iso.datetime()]) };
const dated = { startDate: date, endDate: optionalDate, current: checkbox };
const translated = { enTitle: text, ptTitle: z.string().trim().max(500).default(""), enDescription: optionalText, ptDescription: optionalText };

const editorBlockSchema = z.discriminatedUnion("type", [
  blockSchema.options[0].strict(), blockSchema.options[1].strict(),
  blockSchema.options[2].strict(), blockSchema.options[3].strict(),
  blockSchema.options[4].strict(), blockSchema.options[5].extend({ src: z.url({ error: "url" }).refine((value) => /^https?:\/\//.test(value), { error: "url" }) }).strict(),
  blockSchema.options[6].strict(),
]);
const sectionSchema = z.strictObject({
  id: z.string().trim().min(1).max(100),
  title: text,
  number: z.string().max(20).optional(),
  blocks: z.array(editorBlockSchema).max(200),
});

// Loading checks editable structure; completeness and limits belong to saving.
const editableBlockSchema = z.discriminatedUnion("type", [
  editorBlockSchema.options[0].extend({ text: z.string() }),
  editorBlockSchema.options[1].extend({ text: z.string() }),
  editorBlockSchema.options[2],
  editorBlockSchema.options[3].extend({ text: z.string() }),
  editorBlockSchema.options[4].extend({ items: z.array(z.string()) }),
  editorBlockSchema.options[5].extend({ src: z.string() }),
  editorBlockSchema.options[6].extend({ text: z.string() }),
]);
export const editableSectionsSchema = z.array(sectionSchema.extend({
  id: z.string(),
  title: z.string(),
  number: z.string().optional(),
  blocks: z.array(editableBlockSchema),
}));

export function decodeEditorSections(value: string): { kind: "valid"; sections: z.output<typeof editableSectionsSchema> } | { kind: "invalid"; raw: string } {
  try {
    const result = editableSectionsSchema.safeParse(JSON.parse(value));
    return result.success ? { kind: "valid", sections: result.data } : { kind: "invalid", raw: value };
  } catch { return { kind: "invalid", raw: value }; }
}

export const sectionsSchema = z.array(sectionSchema).max(100).superRefine((sections, context) => {
  const ids = new Set<string>();
  sections.forEach((section, index) => {
    if (ids.has(section.id)) context.addIssue({ code: "custom", path: [index, "id"], message: "duplicateAnchor" });
    ids.add(section.id);
  });
});
const sections = z.string().max(800000).transform((value, context) => {
  try { return JSON.parse(value); }
  catch { context.addIssue({ code: "custom", message: "json" }); return z.NEVER; }
}).pipe(sectionsSchema);
const slug = z.string().trim().min(1).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: "slug" });

export const contentSchema = z.discriminatedUnion("kind", [
  z.object({ ...base, kind: z.literal("profile"), name: text, email: z.union([z.literal(""), z.email()]), github: url, linkedin: url, instagram: url, enBio: optionalText, ptBio: optionalText, enCvUrl: url, ptCvUrl: url }),
  z.object({ ...base, ...dated, ...translated, kind: z.literal("experience"), company: text }),
  z.object({ ...base, ...dated, ...translated, kind: z.literal("education"), institution: text, sortOrder: order }),
  z.object({ ...base, kind: z.literal("certification"), name: text, issuer: text, url, issuedAt: optionalDate, sortOrder: order }),
  z.object({ ...base, kind: z.literal("language"), enTitle: text, ptTitle: text, levelKey: z.enum(["native", "advanced", "intermediate", "basic"]), sortOrder: order }),
  z.object({ ...base, ...translated, kind: z.literal("project"), slug, type: z.enum(["personal", "professional"]), imageUrl: url, link: url, github: url, tags: z.string().max(1000) }),
  z.object({ ...base, kind: z.literal("article"), slug, number: text, icon: text, readTime: text, relatedSlugs: z.string().max(1000), tags: z.string().max(1000), published: checkbox, enTitle: text, ptTitle: z.string().trim().max(500), enIntro: z.string().trim().min(1).max(30000), ptIntro: optionalText, enSections: sections, ptSections: sections }),
]).superRefine((value, context) => {
  if (value.id && !value.version) context.addIssue({ code: "custom", path: ["version"], message: "reload" });
  if ("startDate" in value && value.endDate && value.endDate < value.startDate) context.addIssue({ code: "custom", path: ["endDate"], message: "dateOrder" });
  if ("current" in value && value.current && value.endDate) context.addIssue({ code: "custom", path: ["endDate"], message: "currentEndDate" });
  if ("ptDescription" in value && value.ptDescription && !value.ptTitle) context.addIssue({ code: "custom", path: ["ptTitle"], message: "translationTitle" });
  if (value.kind === "article") {
    if (value.published && !value.enSections.some((section) => section.blocks.length)) context.addIssue({ code: "custom", path: ["enSections"], message: "articleContent" });
    if ((value.ptIntro || value.ptSections.length) && !value.ptTitle) context.addIssue({ code: "custom", path: ["ptTitle"], message: "translationTitle" });
    if (value.ptTitle && !value.ptIntro) context.addIssue({ code: "custom", path: ["ptIntro"], message: "translationIntro" });
    if (value.published && value.ptTitle && !value.ptSections.some((section) => section.blocks.length)) context.addIssue({ code: "custom", path: ["ptSections"], message: "articleContent" });
  }
});

export type ActionState = { kind: "idle" } | { kind: "error"; code: "invalid" | "save" | "conflict" | "auth" | "config"; fields: string[] } | { kind: "invalid"; issues: ValidationIssue[] };
export type EditorValues = Record<string, string | boolean>;

export function isAllowedAdmin({ email, allowedEmail }: { email: string | undefined; allowedEmail: string | undefined }) {
  return Boolean(email && allowedEmail && email.toLowerCase() === allowedEmail.trim().toLowerCase());
}
