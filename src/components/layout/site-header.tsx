import { getTranslations } from "next-intl/server";

import GradualBlur from "@/components/effects/gradual-blur";
import { LocaleSwitcher } from "@/components/navigation/locale-switcher";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { NavLinks } from "@/components/navigation/nav-links";
import { Link } from "@/i18n/navigation";
import { LAYER_STEP } from "@/lib/motion";

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
  const status = await getTranslations("Status");

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* O desfoque progressivo acompanha a altura da barra, sem fundo solido. */}
      <GradualBlur
        target="parent"
        position="top"
        height="100%"
        strength={2}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={0}
      />
      <div className="relative z-10 mx-auto flex h-16 w-full max-w-[110rem] items-center justify-between gap-6 px-4 lg:px-8">
        <Link
          href="/"
          className="chrome-rise group relative z-20 flex items-center gap-3"
          aria-label="William Nakata"
        >
          <span
            aria-hidden="true"
            className="font-mono text-lg font-light tracking-[0.12em] text-foreground transition-none group-hover:text-lavender"
          >
            WN
          </span>
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border-strong sm:block"
          />
          <span className="hidden items-baseline gap-5 sm:flex">
            <span className="font-mono text-[0.7rem] font-medium tracking-[0.26em] text-foreground uppercase">
              William Nakata
            </span>
            <span className="hud-label hidden 2xl:block">
              {hero("headline")}
            </span>
          </span>
        </Link>

        <div
          aria-hidden="true"
          className="chrome-draw relative mx-10 hidden h-px flex-1 bg-gradient-to-r from-transparent via-border-strong to-transparent lg:block"
        ></div>

        <nav
          aria-label={t("menu")}
          className="hidden items-center gap-1 md:flex"
        >
          <NavLinks
            items={navItems.map(({ key, href }) => ({
              key,
              href,
              label: t(key),
            }))}
          />
          <div
            className="chrome-rise"
            style={{ animationDelay: `${0.12 + navItems.length * LAYER_STEP}s` }}
          >
            <LocaleSwitcher />
          </div>
        </nav>

        {/* O painel do MobileNav cobre a tela por baixo desta barra: marca e
            controles ficam acima dele (z-20). */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="relative z-20">
            <LocaleSwitcher />
          </div>
          <MobileNav
            items={navItems.map(({ key, href }) => ({
              key,
              href,
              label: t(key),
            }))}
            labels={{
              menu: t("menu"),
              close: t("close"),
              contact: hero("ctaContact"),
              currently: status("currently"),
              location: status("value"),
            }}
          />
        </div>
      </div>
    </header>
  );
}
