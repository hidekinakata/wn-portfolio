import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";

const navItems = [
  { key: "about", href: "/#about" },
  { key: "experience", href: "/#experience" },
  { key: "projects", href: "/#projects" },
  { key: "education", href: "/#education" },
  { key: "blog", href: "/blog" },
] as const satisfies ReadonlyArray<{ key: NavKey; href: string }>;

type NavKey = "about" | "experience" | "projects" | "education" | "blog";

/**
 * Header fixo do site. Componente de servidor: sem JS proprio, exceto o
 * `LocaleSwitcher` (client).
 */
export async function SiteHeader() {
  const t = await getTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-tight text-foreground"
          aria-label="William Nakata"
        >
          <span aria-hidden="true">WN</span>
        </Link>

        <nav aria-label={t("skipToContent")} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navItems.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
