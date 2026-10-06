import { getTranslations } from "next-intl/server";

/**
 * Rodape estatico (sem `new Date()` para nao quebrar a renderizacao estatica
 * do Cache Components).
 */
export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col gap-3 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© William Nakata · {t("rights")}</p>
        <p className="font-mono text-xs text-subtle-foreground">
          Next.js · Supabase · Motion
        </p>
      </div>
    </footer>
  );
}
