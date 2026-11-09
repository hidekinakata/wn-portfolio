"use client";

import { useTranslations } from "next-intl";

export default function AdminError({ reset }: { reset: () => void }) {
  const t = useTranslations("Admin");
  return <main className="admin-load-error"><h1>{t("title")}</h1><p role="alert">{t("errors.load")}</p><button className="admin-button" onClick={reset}>{t("errors.retry")}</button></main>;
}
