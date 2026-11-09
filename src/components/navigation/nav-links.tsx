"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LAYER_STEP } from "@/lib/motion";
import { useActiveSection } from "@/lib/use-active-section";

type NavLinkItem = {
  key: string;
  href: string;
  label: string;
};

const SECTION_IDS = ["about", "experience", "projects", "education"] as const;

/**
 * Links da barra do console. O item da secao em leitura (ou do blog, na rota
 * dele) fica aceso: texto pleno e filete laranja que corre da esquerda. Entrada
 * escalonada atras da marca, depois da cortina de abertura.
 */
export function NavLinks({ items }: { items: readonly NavLinkItem[] }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const section = useActiveSection({ ids: SECTION_IDS, enabled: onHome });

  return (
    <ul className="flex items-center gap-1">
      {items.map(({ key, href, label }, index) => {
        const isActive = onHome
          ? href === `/#${section}`
          : href !== "/" && pathname.startsWith(href);

        return (
          <li
            key={key}
            className="chrome-rise"
            style={{ animationDelay: `${0.12 + index * LAYER_STEP}s` }}
          >
            <Link
              href={href}
              data-active={isActive}
              aria-current={isActive ? "true" : undefined}
              className="nav-link relative block px-2 py-2 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase transition-none hover:bg-accent hover:text-foreground data-[active=true]:text-foreground"
            >
              {label}
              <span aria-hidden="true" className="nav-line" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
