import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNav } from "@/components/mobile-nav";
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
 * Barra do console: marca + lockup a esquerda, hairline com cruzeta ao meio,
 * navegacao + idioma a direita. Sem JS proprio exceto `LocaleSwitcher` e
 * `MobileNav` (clients).
 */
export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const hero = await getTranslations("Hero");

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[110rem] items-center justify-between gap-6 px-4 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="William Nakata"
        >
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center border border-border-strong font-mono text-sm font-semibold text-foreground transition-none group-hover:border-flow group-hover:text-flow"
          >
            WN
          </span>
          <span className="hidden flex-col gap-1 sm:flex">
            <span className="font-mono text-[0.7rem] font-semibold tracking-[0.22em] text-foreground uppercase">
              William Nakata
            </span>
            <span className="hud-label hidden xl:block">{hero("headline")}</span>
          </span>
        </Link>

        <div
          aria-hidden="true"
          className="mx-8 hidden h-px flex-1 bg-border lg:block"
        />
        <span
          aria-hidden="true"
          className="hidden font-mono text-xs text-border-strong lg:block"
        >
          +
        </span>

        <nav aria-label={t("menu")} className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {navItems.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="block px-3 py-2 font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground uppercase transition-none hover:bg-accent hover:text-foreground"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
          <LocaleSwitcher />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <MobileNav
            items={navItems.map(({ key, href }) => ({
              key,
              href,
              label: t(key),
            }))}
          />
        </div>
      </div>
    </header>
  );
}
