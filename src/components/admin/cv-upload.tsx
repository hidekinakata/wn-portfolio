"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, FileUp, Upload } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { cvUploadResponseSchema, validateCvFile, type CvUploadResponse } from "@/lib/admin/cv-upload";

type UploadState = { kind: "idle" } | { kind: "uploading"; name: string } | { kind: "success"; name: string } | Extract<CvUploadResponse, { kind: "error" }>;

export function CvUpload({ language, disabled, onUploaded, onBusyChange }: { language: Locale; disabled: boolean; onUploaded: (url: string) => void; onBusyChange: (busy: boolean) => void }) {
  const t = useTranslations("Admin.cvUpload");
  const id = useId();
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function upload(file: File) {
    if (disabled || request.current) return;
    const invalid = validateCvFile(file);
    if (invalid) { setState({ kind: "error", code: invalid }); return; }
    const controller = new AbortController();
    request.current = controller;
    setState({ kind: "uploading", name: file.name });
    onBusyChange(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("language", language);
      const response = await fetch("/api/admin/cv", { method: "POST", body: form, signal: controller.signal });
      const raw: unknown = await response.json();
      const result = cvUploadResponseSchema.safeParse(raw);
      if (!result.success) { setState({ kind: "error", code: "upload" }); return; }
      if (result.data.kind === "error") { setState(result.data); return; }
      if (!response.ok) { setState({ kind: "error", code: "upload" }); return; }
      onUploaded(result.data.url);
      setState({ kind: "success", name: file.name });
    } catch {
      if (!controller.signal.aborted) setState({ kind: "error", code: "upload" });
    } finally {
      request.current = null;
      onBusyChange(false);
    }
  }

  return <div className="admin-cv-upload admin-field-wide" role="group" aria-labelledby={`${id}-title`}>
    <div className="admin-cv-drop" data-dragging={dragging} aria-busy={state.kind === "uploading"}
      onDragEnter={(event) => { event.preventDefault(); depth.current++; if (!disabled) setDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? "none" : "copy"; }}
      onDragLeave={(event) => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); depth.current = 0; setDragging(false); if (disabled) return; if (event.dataTransfer.files.length !== 1) { setState({ kind: "error", code: "single" }); return; } const file = event.dataTransfer.files.item(0); if (file) void upload(file); }}>
      <FileUp size={22} aria-hidden="true" />
      <div><p id={`${id}-title`}>{t("title")}</p><p id={`${id}-help`} className="admin-help">{t("help")}</p></div>
      <input id={id} className="sr-only" type="file" accept="application/pdf,.pdf" disabled={disabled} aria-describedby={`${id}-help ${id}-status`} onChange={(event) => { const file = event.target.files?.item(0); event.target.value = ""; if (file) void upload(file); }} />
      <label htmlFor={id} className="admin-button admin-cv-select" aria-disabled={disabled}><Upload size={15} aria-hidden="true" />{t(state.kind === "uploading" ? "uploading" : "select")}</label>
    </div>
    <p id={`${id}-status`} className={state.kind === "error" ? "admin-error" : "admin-help admin-cv-status"} role={state.kind === "error" ? "alert" : "status"}>
      {state.kind === "error" ? t(`errors.${state.code}`) : state.kind === "success" ? <><Check size={14} aria-hidden="true" />{t("uploaded", { name: state.name })}</> : state.kind === "uploading" ? t("progress", { name: state.name }) : t("privacy")}
    </p>
  </div>;
}
