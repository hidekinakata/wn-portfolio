"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login } from "@/lib/admin/actions";
import type { ActionState } from "@/lib/admin/schema";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

export function LoginForm({ locale, configured }: { locale: Locale; configured: boolean }) {
  const t = useTranslations("Admin");
  const [state, action, pending] = useActionState<ActionState, FormData>(login, { kind: "idle" });
  return <main id="main" className="admin-login">
    <div className="admin-login-brand"><span className="admin-monogram">WN</span><span>William Nakata</span></div>
    <div className="admin-login-grid">
      <section className="admin-login-intro"><LockKeyhole size={28} aria-hidden="true" /><h1>{t("loginTitle")}</h1><p>{t("loginDescription")}</p><div className="admin-login-languages">English <span>/</span> Português</div></section>
      <section className="admin-login-panel"><h2>{t("login")}</h2><p>{t("private")}</p>
        <form action={action}>
          <input type="hidden" name="locale" value={locale} />
          <label className="admin-field"><span>{t("email")}</span><input name="email" type="email" autoComplete="username" required maxLength={320} /></label>
          <label className="admin-field"><span>{t("password")}</span><input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label>
          {!configured ? <p className="admin-error" role="alert">{t("errors.config")}</p> : null}
          {state.kind === "error" ? <p className="admin-error" role="alert">{t(`errors.${state.code}`)}</p> : null}
          <button className="admin-button admin-primary" disabled={pending || !configured}>{pending ? t("loggingIn") : t("login")}<ArrowRight size={16} aria-hidden="true" /></button>
        </form>
        <p className="admin-help">{t("loginHelp")}</p>
      </section>
    </div>
    <footer className="admin-login-footer"><Link href="/">{t("back")} <ArrowRight size={14} aria-hidden="true" /></Link><div><Link href="/admin/login" locale="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href="/admin/login" locale="pt-BR" aria-current={locale === "pt-BR" ? "page" : undefined}>PT-BR</Link></div></footer>
  </main>;
}
