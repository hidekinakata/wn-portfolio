"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, ChevronRight, Folder, GraduationCap, Languages, LogOut, Plus, Search, ShieldCheck, UserRound, Award } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { contentKinds, type ContentKind, type EditorValues } from "@/lib/admin/schema";
import type { AdminEntry } from "@/lib/admin/data";
import { logout } from "@/lib/admin/actions";
import { ContentEditor } from "@/components/admin/content-editor";

const icons = { profile: UserRound, experience: BriefcaseBusiness, education: GraduationCap, certification: Award, language: Languages, project: Folder, article: BookOpen };

export function Workspace({ locale, kind, entries, selectedId, values, saved }: { locale: Locale; kind: ContentKind; entries: AdminEntry[]; selectedId: string; values: EditorValues | null; saved: boolean }) {
  const t = useTranslations("Admin");
  const [search, setSearch] = useState("");
  const filtered = entries.filter((entry) => `${entry.title} ${entry.detail}`.toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale)));
  const selected = entries.find((entry) => entry.id === selectedId);
  return <div className="admin-shell">
    <a href="#editor" className="admin-skip">{t("skip")}</a>
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand"><span className="admin-monogram">WN</span><span>William Nakata<small>{t("private")}</small></span></Link>
      <nav aria-label={t("sections")}>
        <p className="admin-nav-label">{t("portfolio")}</p>
        {contentKinds.map((section) => { const Icon = icons[section]; return <div key={section}>{section === "article" ? <p className="admin-nav-label">{t("writing")}</p> : null}<Link href={{ pathname: "/admin", query: { section } }} aria-current={kind === section ? "page" : undefined} className="admin-nav-link"><Icon size={17} aria-hidden="true" /><span>{t(`kinds.${section}`)}</span>{kind === section ? <ChevronRight size={14} aria-hidden="true" /> : null}</Link></div>; })}
      </nav>
      <div className="admin-sidebar-bottom"><Link href="/" target="_blank" className="admin-nav-link">{t("back")}<ArrowUpRight size={16} aria-hidden="true" /></Link><form action={logout}><input type="hidden" name="locale" value={locale} /><button className="admin-nav-link"><LogOut size={16} aria-hidden="true" />{t("signOut")}</button></form><div className="admin-session"><ShieldCheck size={15} aria-hidden="true" />{t("private")}</div></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><div><h1>{t("title")}</h1><p>{t("subtitle")}</p></div><div className="admin-ui-locales"><Link href={{ pathname: "/admin", query: { section: kind, id: selectedId } }} locale="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href={{ pathname: "/admin", query: { section: kind, id: selectedId } }} locale="pt-BR" aria-current={locale === "pt-BR" ? "page" : undefined}>PT-BR</Link></div></header>
      <div className="admin-workarea">
        <aside className="admin-entry-panel" aria-label={t("entries")}>
          <div className="admin-entry-heading"><h2>{t(`kinds.${kind}`)}</h2><span>{entries.length}</span></div>
          {kind !== "profile" || !entries.length ? <Link className="admin-button admin-new" href={{ pathname: "/admin", query: { section: kind, id: "new" } }}><Plus size={16} aria-hidden="true" />{kind === "article" ? t("newArticle") : t("new")}</Link> : null}
          {entries.length > 0 ? <label className="admin-search"><Search size={16} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search")} aria-label={t("search")} /></label> : null}
          <div className="admin-entry-list">{filtered.map((entry) => <Link key={entry.id} className="admin-entry" href={{ pathname: "/admin", query: { section: kind, id: entry.id } }} aria-current={selectedId === entry.id ? "page" : undefined}><span className="admin-entry-title">{entry.title}</span>{entry.detail ? <span className="admin-entry-detail">{entry.detail}</span> : null}<span className={`admin-status admin-status-${entry.state}`}><span aria-hidden="true" />{t(`states.${entry.state}`)}</span></Link>)}</div>
          {!filtered.length ? <div className="admin-empty-list"><BookOpen size={24} aria-hidden="true" /><p>{entries.length ? t("noResults") : t("noEntries")}</p>{!entries.length ? <small>{t("emptyHelp")}</small> : null}</div> : null}
        </aside>
        <main id="editor" className="admin-editor-region" tabIndex={-1}>
          {values ? <ContentEditor key={`${kind}:${selectedId}:${values.version}`} locale={locale} kind={kind} values={values} saved={saved} title={selected?.title ?? t(kind === "article" ? "newArticle" : "new")} /> : <p className="admin-empty-editor">{t("notFound")}</p>}
        </main>
      </div>
    </div>
  </div>;
}
