"use client";

import { useState } from "react";

import { LitOnView } from "@/components/lit-on-view";

type SkillBenchGroup = {
  key: string;
  label: string;
  items: readonly string[];
};

type SkillBenchProps = {
  title: string;
  /** Leitura em repouso (ex.: "29 skills · 3 groups"), montada no servidor. */
  idleReadout: string;
  groups: readonly SkillBenchGroup[];
};

type ActiveSkill = { group: string; item: string };

/** Atraso entre uma tecla e a proxima ao acender o grupo. */
const CASCADE_MS = 34;

/**
 * Bancada de skills: cada grupo e um canal; cada skill, uma tecla com LED que
 * acende em cascata quando o canal entra na tela. Passar o ponteiro sobre uma
 * tecla escreve a leitura no cabecalho. A leitura e so apoio visual
 * (`aria-hidden`): a lista em si e texto simples, na ordem do curriculo.
 * Cada canal empilha rotulo e teclas, entao a bancada cabe em qualquer coluna.
 */
export function SkillBench({ title, idleReadout, groups }: SkillBenchProps) {
  const [active, setActive] = useState<ActiveSkill | null>(null);

  return (
    <div onPointerLeave={() => setActive(null)}>
      <div className="flex items-baseline justify-between gap-4 border-t border-border-strong pt-4 pb-4">
        <p className="hud-label shrink-0">{title}</p>
        <p
          aria-hidden="true"
          className="hud-label min-h-[1em] min-w-0 truncate text-right text-flow-light"
        >
          {active ? `${active.group} / ${active.item}` : idleReadout}
        </p>
      </div>

      <div>
        {groups.map((group) => (
          <LitOnView key={group.key} className="border-t border-border py-5">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-mono text-xs tracking-[0.18em] text-flow uppercase">
                {group.label}
              </h3>
              <p className="hud-label font-mono tabular-nums">
                {String(group.items.length).padStart(2, "0")}
              </p>
            </div>

            <ul className="mt-3.5 flex flex-wrap gap-1.5">
              {group.items.map((item, index) => (
                <li
                  key={item}
                  className="lit-chip"
                  style={{ animationDelay: `${index * CASCADE_MS}ms` }}
                  onPointerEnter={() => setActive({ group: group.label, item })}
                >
                  {item}
                </li>
              ))}
            </ul>
          </LitOnView>
        ))}
        <div className="border-t border-border" aria-hidden="true" />
      </div>
    </div>
  );
}
