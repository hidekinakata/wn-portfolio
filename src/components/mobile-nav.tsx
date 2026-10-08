"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";

export type MobileNavItem = {
  key: string;
  href: string;
  label: string;
};

type MobileNavProps = {
  items: readonly MobileNavItem[];
  label?: string;
};

/**
 * Navegacao compacta (mobile). O painel abre em corte seco — o vocabulario de
 * estados do console e aceso/apagado, nunca meio-termo.
 */
export function MobileNav({ items, label = "Menu" }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center border border-border-strong text-foreground transition-none hover:border-flow hover:text-flow"
      >
        {open ? (
          <X aria-hidden="true" className="size-4" />
        ) : (
          <Menu aria-hidden="true" className="size-4" />
        )}
      </button>

      {open ? (
        <nav
          aria-label={label}
          className="absolute right-0 top-[calc(100%+0.75rem)] w-56 border border-border-strong bg-card"
        >
          <ul className="flex flex-col">
            {items.map(({ key, href, label: itemLabel }) => (
              <li key={key}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border px-4 py-3 font-mono text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase transition-none last:border-b-0 hover:bg-accent hover:text-foreground"
                >
                  {itemLabel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
