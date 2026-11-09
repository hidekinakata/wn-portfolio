"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { blockSchema, type ArticleBlock } from "@/lib/article-content";
import { decodeEditorSections, editableSectionsSchema } from "@/lib/admin/schema";
import { validationControl, type ValidationIssue } from "@/lib/admin/validation";

type Sections = z.infer<typeof editableSectionsSchema>;

function newBlock(type: ArticleBlock["type"]): ArticleBlock {
  switch (type) {
    case "heading": return { type, text: "" };
    case "paragraph": return { type, text: "" };
    case "code": return { type, code: "", language: "text" };
    case "quote": return { type, text: "" };
    case "list": return { type, ordered: false, items: [""] };
    case "image": return { type, src: "", alt: "" };
    case "callout": return { type, text: "" };
    default: { const exhaustive: never = type; return exhaustive; }
  }
}

function move<T>(items: T[], index: number, direction: number) {
  const next = [...items];
  const item = next[index], neighbor = next[index + direction];
  if (item !== undefined && neighbor !== undefined) { next[index] = neighbor; next[index + direction] = item; }
  return next;
}

export function BlockEditor({ name, value, preview, issues, onChange }: { name: string; value: string; preview: boolean; issues: ValidationIssue[]; onChange: (value: string) => void }) {
  const t = useTranslations("Admin");
  const [content, setContent] = useState(() => decodeEditorSections(value));
  const update = (sections: Sections) => { setContent({ kind: "valid", sections }); onChange(JSON.stringify(sections)); };
  if (content.kind === "invalid") return <div className="admin-block-content"><p className="admin-error">{t("invalidContent")}</p><label className="admin-field"><span>{t("content")} · JSON</span><textarea id={`field-${name}`} aria-invalid={issues.some((issue) => issue.path.startsWith(name))} aria-describedby={issues.find((issue) => issue.path.startsWith(name)) ? `error-${issues.find((issue) => issue.path.startsWith(name))?.path}` : undefined} rows={16} value={content.raw} onChange={(event) => { setContent({ kind: "invalid", raw: event.target.value }); onChange(event.target.value); }} /></label><input type="hidden" name={name} value={content.raw} /></div>;
  const sections = content.sections;
  return <div className="admin-block-content" {...validationControl({ path: name, issues })} tabIndex={-1}>
    <input type="hidden" name={name} value={JSON.stringify(sections)} />
    <div className="admin-content-heading"><h3>{t("content")}</h3>{!preview ? <button className="admin-button admin-small" type="button" onClick={() => update([...sections, { id: crypto.randomUUID(), title: "", blocks: [] }])}><Plus size={14} aria-hidden="true" />{t("addSection")}</button> : null}</div>
    {preview ? <div className="admin-preview"><p className="admin-help">{t("previewHint")}</p>{!sections.length ? <p>{t("previewEmpty")}</p> : null}{sections.map((section) => <section key={section.id}><h3>{section.title}</h3>{section.blocks.map((block, index) => <PreviewBlock key={index} block={block} />)}</section>)}</div> : <>
      {!sections.length ? <p className="admin-block-empty">{t("noSections")}</p> : null}
      {sections.map((section, sectionIndex) => {
        const changeSection = (next: Sections[number]) => update(sections.map((entry, index) => index === sectionIndex ? next : entry));
        const control = (field: string) => validationControl({ path: `${name}.${sectionIndex}.${field}`, issues });
        return <section className="admin-section-editor" key={sectionIndex}>
          <div className="admin-section-toolbar"><h4>{t("section")} {sectionIndex + 1}</h4><div><button type="button" className="admin-icon-button" title={t("moveUp")} aria-label={`${t("moveUp")} · ${t("section")} ${sectionIndex + 1}`} disabled={!sectionIndex} onClick={() => update(move(sections, sectionIndex, -1))}><ArrowUp size={15} /></button><button type="button" className="admin-icon-button" title={t("moveDown")} aria-label={`${t("moveDown")} · ${t("section")} ${sectionIndex + 1}`} disabled={sectionIndex === sections.length - 1} onClick={() => update(move(sections, sectionIndex, 1))}><ArrowDown size={15} /></button><button type="button" className="admin-icon-button" aria-label={`${t("removeSection")} ${sectionIndex + 1}`} title={t("removeSection")} onClick={() => { if (window.confirm(t("confirmRemoveSection"))) update(sections.filter((_, index) => index !== sectionIndex)); }}><Trash2 size={15} /></button></div></div>
          <div className="admin-field-grid"><label className="admin-field admin-field-wide"><span>{t("sectionTitle")}</span><input {...control("title")} value={section.title} maxLength={500} onChange={(event) => changeSection({ ...section, title: event.target.value })} /></label><label className="admin-field"><span>{t("sectionId")}</span><input {...control("id")} value={section.id} maxLength={100} onChange={(event) => changeSection({ ...section, id: event.target.value })} /></label><label className="admin-field"><span>{t("sectionNumber")}</span><input {...control("number")} value={section.number ?? ""} maxLength={20} onChange={(event) => changeSection({ ...section, number: event.target.value || undefined })} /></label></div>
          {section.blocks.map((block, blockIndex) => <div className="admin-block-editor" key={blockIndex}><div className="admin-block-toolbar"><strong>{t(`blocks.${block.type}`)}</strong><div><button type="button" className="admin-icon-button" aria-label={`${t("moveUp")} · ${t(`blocks.${block.type}`)} ${blockIndex + 1}`} disabled={!blockIndex} onClick={() => changeSection({ ...section, blocks: move(section.blocks, blockIndex, -1) })}><ArrowUp size={14} /></button><button type="button" className="admin-icon-button" aria-label={`${t("moveDown")} · ${t(`blocks.${block.type}`)} ${blockIndex + 1}`} disabled={blockIndex === section.blocks.length - 1} onClick={() => changeSection({ ...section, blocks: move(section.blocks, blockIndex, 1) })}><ArrowDown size={14} /></button><button type="button" className="admin-icon-button" aria-label={`${t("removeBlock")} · ${t(`blocks.${block.type}`)} ${blockIndex + 1}`} onClick={() => { if (window.confirm(t("confirmRemoveBlock"))) changeSection({ ...section, blocks: section.blocks.filter((_, index) => index !== blockIndex) }); }}><Trash2 size={14} /></button></div></div><BlockFields block={block} path={`${name}.${sectionIndex}.blocks.${blockIndex}`} issues={issues} onChange={(next) => changeSection({ ...section, blocks: section.blocks.map((entry, index) => index === blockIndex ? next : entry) })} /></div>)}
          <AddBlock onAdd={(block) => changeSection({ ...section, blocks: [...section.blocks, block] })} />
        </section>;
      })}
    </>}
  </div>;
}

function AddBlock({ onAdd }: { onAdd: (block: ArticleBlock) => void }) {
  const t = useTranslations("Admin");
  const [type, setType] = useState<ArticleBlock["type"]>("paragraph");
  const id = useId();
  return <div className="admin-add-block"><label className="sr-only" htmlFor={id}>{t("blockType")}</label><select id={id} value={type} onChange={(event) => { const result = z.enum(["heading", "paragraph", "code", "quote", "list", "image", "callout"]).safeParse(event.target.value); if (result.success) setType(result.data); }}>{blockSchema.options.map((option) => <option key={option.shape.type.value} value={option.shape.type.value}>{t(`blocks.${option.shape.type.value}`)}</option>)}</select><button type="button" className="admin-button" onClick={() => onAdd(newBlock(type))}><Plus size={15} aria-hidden="true" />{t("addBlock")}</button></div>;
}

function BlockFields({ block, path, issues, onChange }: { block: ArticleBlock; path: string; issues: ValidationIssue[]; onChange: (block: ArticleBlock) => void }) {
  const t = useTranslations("Admin");
  const control = (field: string) => validationControl({ path: `${path}.${field}`, issues });
  switch (block.type) {
    case "heading": case "paragraph": return <label className="admin-field"><span>{t("text")}</span><textarea {...control("text")} rows={block.type === "heading" ? 2 : 5} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} /></label>;
    case "code": return <div className="admin-field-grid"><label className="admin-field"><span>{t("codeLanguage")}</span><input {...control("language")} value={block.language} onChange={(event) => onChange({ ...block, language: event.target.value })} /></label><label className="admin-field"><span>{t("filename")}</span><input {...control("filename")} value={block.filename ?? ""} onChange={(event) => onChange({ ...block, filename: event.target.value })} /></label><label className="admin-field admin-field-wide"><span>{t("code")}</span><textarea {...control("code")} className="admin-code" rows={8} spellCheck={false} value={block.code} onChange={(event) => onChange({ ...block, code: event.target.value })} /></label></div>;
    case "quote": return <div className="admin-field-grid"><label className="admin-field admin-field-wide"><span>{t("text")}</span><textarea {...control("text")} rows={4} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} /></label><label className="admin-field"><span>{t("author")}</span><input {...control("author")} value={block.author ?? ""} onChange={(event) => onChange({ ...block, author: event.target.value })} /></label><label className="admin-field"><span>{t("year")}</span><input {...control("year")} value={block.year ?? ""} onChange={(event) => onChange({ ...block, year: event.target.value })} /></label></div>;
    case "list": return <><label className="admin-field"><span>{t("items")}</span><textarea {...control("items")} rows={5} value={block.items.join("\n")} onChange={(event) => onChange({ ...block, items: event.target.value.split("\n") })} /></label><label className="admin-checkbox"><input {...control("ordered")} type="checkbox" checked={block.ordered} onChange={(event) => onChange({ ...block, ordered: event.target.checked })} />{t("ordered")}</label></>;
    case "image": return <div className="admin-field-grid"><label className="admin-field admin-field-wide"><span>{t("imageSrc")}</span><input {...control("src")} type="url" value={block.src} onChange={(event) => onChange({ ...block, src: event.target.value })} /></label><label className="admin-field"><span>{t("imageAlt")}</span><input {...control("alt")} value={block.alt} onChange={(event) => onChange({ ...block, alt: event.target.value })} /></label><label className="admin-field"><span>{t("caption")}</span><input {...control("caption")} value={block.caption ?? ""} onChange={(event) => onChange({ ...block, caption: event.target.value })} /></label></div>;
    case "callout": return <><label className="admin-field"><span>{t("calloutTitle")}</span><input {...control("title")} value={block.title ?? ""} onChange={(event) => onChange({ ...block, title: event.target.value })} /></label><label className="admin-field"><span>{t("text")}</span><textarea {...control("text")} rows={4} value={block.text} onChange={(event) => onChange({ ...block, text: event.target.value })} /></label></>;
    default: { const exhaustive: never = block; return exhaustive; }
  }
}

function PreviewBlock({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading": return <h4>{block.text}</h4>;
    case "paragraph": return <p>{block.text}</p>;
    case "code": return <pre><code>{block.code}</code></pre>;
    case "quote": return <figure><blockquote>{block.text}</blockquote><figcaption>{block.author} {block.year}</figcaption></figure>;
    case "list": { const List = block.ordered ? "ol" : "ul"; return <List>{block.items.map((item, index) => <li key={index}>{item}</li>)}</List>; }
    case "image": return <figure>{/^https?:\/\//.test(block.src) ?
      // Arbitrary author-supplied hosts are previewed without Next image optimization.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={block.src} alt={block.alt} loading="lazy" /> : null}<figcaption>{block.caption}</figcaption></figure>;
    case "callout": return <aside><strong>{block.title}</strong><p>{block.text}</p></aside>;
    default: { const exhaustive: never = block; return exhaustive; }
  }
}
