import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/auth";
import { contentKindSchema } from "@/lib/admin/schema";
import { getEditorValues, listEntries } from "@/lib/admin/data";
import { Workspace } from "@/components/admin/workspace";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ section?: string; id?: string; saved?: string }> };

export default function AdminPage(props: Props) {
  return <Suspense fallback={<div className="admin-loading" aria-busy="true"><div /><div /><div /></div>}><AdminContent {...props} /></Suspense>;
}

async function AdminContent({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin(locale);
  const query = await searchParams;
  const section = contentKindSchema.safeParse(query.section ?? "profile");
  if (!section.success) notFound();
  const kind = section.data;
  const entries = await listEntries({ kind, locale });
  const selectedId = kind === "profile" ? entries[0]?.id ?? "new" : query.id ?? entries[0]?.id ?? "new";
  const values = await getEditorValues({ kind, id: selectedId });
  return <Workspace locale={locale} kind={kind} entries={entries} selectedId={selectedId} values={values} saved={query.saved === "1"} />;
}
