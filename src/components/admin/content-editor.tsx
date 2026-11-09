"use client";

import { Fragment, useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Eye, Pencil, Save, Trash2 } from "lucide-react";
import { saveContent, deleteContent } from "@/lib/admin/actions";
import type { ActionState, ContentKind, EditorValues } from "@/lib/admin/schema";
import type { Locale } from "@/i18n/routing";
import { sharedFields, translatedFields, type EditorField } from "@/lib/admin/fields";
import { BlockEditor } from "@/components/admin/block-editor";
import { validationTarget } from "@/lib/admin/validation";
import { CvUpload } from "@/components/admin/cv-upload";

export function ContentEditor({ locale, kind, values: initial, title, saved }: { locale: Locale; kind: ContentKind; values: EditorValues; title: string; saved: boolean }) {
  const t = useTranslations("Admin");
  const [state, action, pending] = useActionState<ActionState, FormData>(saveContent, { kind: "idle" });
  const [values, setValues] = useState(initial);
  const [language, setLanguage] = useState<"en" | "pt">(locale === "en" ? "en" : "pt");
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const update = (name: string, value: string | boolean) => { setValues((current) => ({ ...current, [name]: value })); setDirty(true); };
  const translated = translatedFields(kind);
  const id = typeof initial.id === "string" ? initial.id : "";
  const version = typeof initial.version === "string" ? initial.version : "";
  const issues = state.kind === "invalid" ? state.issues : [];
  const invalidFields = issues.map((issue) => issue.path);
  const fieldLabel = (path: string) => {
    const [name, section, , block, detail] = path.split(".");
    const shared = sharedFields[kind].find((field) => field.name === name);
    if (shared) return t(`fields.${shared.label}`);
    const code = name.startsWith("pt") ? "pt" : "en";
    const field = translated.find((entry) => `${code}${entry.name}` === name);
    if (section !== undefined) {
      const details: Record<string, string> = { title: t(detail !== undefined ? "calloutTitle" : "sectionTitle"), id: t("sectionId"), number: t("sectionNumber"), text: t("text"), code: t("code"), language: t("codeLanguage"), filename: t("filename"), author: t("author"), year: t("year"), items: t("items"), ordered: t("ordered"), src: t("imageSrc"), alt: t("imageAlt"), caption: t("caption") };
      const parts = path.split(".");
      const last = parts[parts.length - 1];
      return `${t(code === "en" ? "english" : "portuguese")} · ${t("section")} ${Number(section) + 1}${detail !== undefined ? ` · ${t("block")} ${Number(block) + 1}` : ""} · ${details[last] ?? t("content")}`;
    }
    return `${t(code === "en" ? "english" : "portuguese")} · ${field ? t(`fields.${field.label}`) : t("content")}`;
  };

  useEffect(() => {
    if ((!dirty && !uploading) || pending) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.target === "_blank" || anchor.getAttribute("href")?.startsWith("#")) return;
      if (anchor.href !== window.location.href && !window.confirm(t("leave"))) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    const submit = (event: SubmitEvent) => {
      if (event.target instanceof HTMLFormElement && !event.target.closest(".admin-content-form, .admin-delete") && !window.confirm(t("leave"))) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    document.addEventListener("submit", submit, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); document.removeEventListener("submit", submit, true); };
  }, [dirty, uploading, pending, t]);

  return <>
    {saved && !dirty ? <div className="admin-save-notice" role="status"><Check size={16} aria-hidden="true" />{t("saved")}</div> : null}
    <form action={action} noValidate className="admin-content-form">
      <input type="hidden" name="locale" value={locale} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} /><input type="hidden" name="version" value={version} />
      <div className="admin-editor-heading"><div><h2>{title}</h2><p>{kind === "article" ? t("draftHint") : t("liveHint")}</p></div>{kind === "article" ? <span className={`admin-status admin-status-${initial.published ? "published" : "draft"}`}><span aria-hidden="true" />{t(initial.published ? "states.published" : "states.draft")}</span> : null}</div>
      {state.kind === "error" || state.kind === "invalid" ? <div className="admin-error" role="alert"><p>{t(`errors.${state.kind === "invalid" ? "invalid" : state.code}`)}</p>{issues.length ? <ul>{issues.map((issue) => <li key={issue.path} id={`error-${issue.path}`}><a href={`#field-${validationTarget(issue.path)}`} onClick={(event) => { event.preventDefault(); if (issue.path.startsWith("en")) setLanguage("en"); if (issue.path.startsWith("pt")) setLanguage("pt"); setPreview(false); requestAnimationFrame(() => { const control = document.getElementById(`field-${validationTarget(issue.path)}`) ?? document.getElementById(`field-${issue.path.split(".")[0]}`); control?.focus(); control?.scrollIntoView({ block: "center" }); }); }}>{fieldLabel(issue.path)}: {t(`validation.${issue.reason}`)}</a></li>)}</ul> : null}</div> : null}
      <fieldset disabled={pending || uploading}>
        <section className="admin-field-section"><h3>{t("shared")}</h3><p className="admin-help">{t("sharedHint")}</p><div className="admin-field-grid">{sharedFields[kind].map((field) => <Field key={field.name} field={field} value={values[field.name] ?? ""} invalid={invalidFields.includes(field.name)} onChange={(value) => update(field.name, value)} />)}</div></section>
        {translated.length ? <section className="admin-field-section">
          <div className="admin-translation-bar"><div className="admin-language-tabs" role="tablist" aria-label={t("translation")}>{(["en", "pt"] satisfies ("en" | "pt")[]).map((code) => <button key={code} id={`tab-${code}`} type="button" role="tab" aria-selected={language === code} aria-controls={`translation-${code}`} tabIndex={language === code ? 0 : -1} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") { event.preventDefault(); const next = event.key === "Home" ? "en" : event.key === "End" ? "pt" : code === "en" ? "pt" : "en"; setLanguage(next); document.getElementById(`tab-${next}`)?.focus(); } }} onClick={() => setLanguage(code)}>{t(code === "en" ? "english" : "portuguese")}{invalidFields.some((field) => field.startsWith(code)) ? <span aria-hidden="true">!</span> : null}</button>)}</div>{kind === "article" ? <button className="admin-button admin-small" type="button" onClick={() => setPreview((value) => !value)}>{preview ? <Pencil size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}{t(preview ? "write" : "preview")}</button> : null}</div>
          <p className="admin-help">{t("translationHint")}</p>
          {(["en", "pt"] satisfies ("en" | "pt")[]).map((code) => <div key={code} id={`translation-${code}`} role="tabpanel" aria-labelledby={`tab-${code}`} hidden={language !== code} tabIndex={0} lang={code === "en" ? "en" : "pt-BR"}>
            <div className="admin-field-grid">{translated.map((field) => { const name = `${code}${field.name}`; return <Fragment key={name}><Field field={{ ...field, name, required: field.required && (code === "en" || kind === "language") }} value={values[name] ?? ""} invalid={invalidFields.includes(name)} onChange={(value) => update(name, value)} />{kind === "profile" && field.name === "CvUrl" ? <CvUpload language={code === "en" ? "en" : "pt-BR"} disabled={pending || uploading} onUploaded={(url) => update(name, url)} onBusyChange={setUploading} /> : null}</Fragment>; })}</div>
            {kind === "article" ? <BlockEditor name={`${code}Sections`} value={String(values[`${code}Sections`] ?? "[]")} preview={preview} issues={issues} onChange={(value) => update(`${code}Sections`, value)} /> : null}
          </div>)}
        </section> : null}
      </fieldset>
      <div className="admin-savebar"><span className="admin-dirty" role="status">{dirty ? <span className="admin-dirty-dot" aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}{t(dirty ? "unsaved" : "clean")}</span><div className="admin-save-actions">
        {kind === "article" ? <><button disabled={pending || uploading} className="admin-button" name="published" value="">{t(initial.published ? "unpublish" : "saveDraft")}</button><button disabled={pending || uploading} className="admin-button admin-primary" name="published" value="on"><Save size={16} aria-hidden="true" />{t(pending ? "saving" : initial.published ? "updatePublished" : "publish")}</button></> : <button className="admin-button admin-primary" disabled={pending || uploading}><Save size={16} aria-hidden="true" />{t(pending ? "saving" : "save")}</button>}
      </div></div>
    </form>
    {id && kind !== "profile" ? <DeleteEntry locale={locale} kind={kind} id={id} version={version} /> : null}
  </>;
}

function Field({ field, value, invalid, onChange }: { field: EditorField; value: string | boolean; invalid: boolean; onChange: (value: string | boolean) => void }) {
  const t = useTranslations("Admin");
  const id = `field-${field.name}`;
  const textValue = typeof value === "string" ? value : "";
  const optionLabels: Record<string, string> = { native: t("options.native"), advanced: t("options.advanced"), intermediate: t("options.intermediate"), basic: t("options.basic"), personal: t("options.personal"), professional: t("options.professional") };
  const validation = { id, "aria-invalid": invalid, "aria-describedby": invalid ? `error-${field.name}` : undefined };
  return <label className={`admin-field ${field.wide ? "admin-field-wide" : ""} ${field.type === "checkbox" ? "admin-checkbox" : ""}`}>
    {field.type === "checkbox" ? <input {...validation} type="checkbox" name={field.name} checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /> : null}
    <span>{t(`fields.${field.label}`)}{field.required ? <small> · {t("required")}</small> : null}</span>
    {field.type === "textarea" ? <textarea {...validation} name={field.name} value={textValue} onChange={(event) => onChange(event.target.value)} rows={field.name.endsWith("Bio") ? 8 : 4} required={field.required} maxLength={30000} />
      : field.type === "select" ? <select {...validation} name={field.name} value={textValue} onChange={(event) => onChange(event.target.value)}>{textValue && !field.options?.includes(textValue) ? <option value={textValue}>{textValue}</option> : null}{field.options?.map((option) => <option value={option} key={option}>{optionLabels[option] ?? option}</option>)}</select>
      : field.type !== "checkbox" ? <input {...validation} type={field.type} name={field.name} value={textValue} onChange={(event) => onChange(event.target.value)} required={field.required} min={field.type === "number" ? 0 : undefined} max={field.type === "number" ? 10000 : undefined} maxLength={field.name === "tags" || field.name === "relatedSlugs" ? 1000 : 500} spellCheck={field.type === "url" || field.name === "slug" ? false : undefined} /> : null}
  </label>;
}

function DeleteEntry({ locale, kind, id, version }: { locale: Locale; kind: ContentKind; id: string; version: string }) {
  const t = useTranslations("Admin");
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteContent, { kind: "idle" });
  return <details className="admin-delete"><summary><Trash2 size={14} aria-hidden="true" />{t("danger")}</summary><form action={action}>
    <input type="hidden" name="locale" value={locale} /><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} /><input type="hidden" name="version" value={version} />
    <p>{t("deleteHint")}</p><label className="admin-checkbox"><input type="checkbox" name="confirm" required />{t("confirmDelete")}</label>
    {state.kind === "error" ? <p role="alert" className="admin-error">{t(`errors.${state.code}`)}</p> : null}
    <button className="admin-button admin-destructive" disabled={pending}>{t(pending ? "deleting" : "delete")}</button>
  </form></details>;
}
