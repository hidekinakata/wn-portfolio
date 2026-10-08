import { ArrowUp } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/**
 * Rodape do console (sem `new Date()` para nao quebrar a renderizacao
 * estatica do Cache Components).
 */
export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="hud-label">
          © William Nakata · {t("rights")}
        </p>
        <p className="hud-label" aria-hidden="true">
          Next.js · Supabase · Motion
        </p>
        <Link
          href="/#home"
          className="flex size-9 items-center justify-center border border-border-strong text-subtle-foreground transition-none hover:border-flow hover:text-flow"
          aria-label="↑"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </footer>
  );
}
