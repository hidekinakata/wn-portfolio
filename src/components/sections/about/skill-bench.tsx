import { LitOnView } from "@/components/motion/lit-on-view";
import { LAYER_STEP } from "@/lib/motion";

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

/** Partitura: referencia fixa, grupos em sequencia e progresso ligado ao scroll. */
export function SkillBench({ title, idleReadout, groups }: SkillBenchProps) {
  return (
    <div className="about-score grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <div className="about-score-reference @container">
          <h3 className="display text-[clamp(2.75rem,18cqw,6rem)] leading-none text-foreground">
            {title}
          </h3>
          <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground">
            {idleReadout}
          </p>
          <span aria-hidden="true" className="about-score-track mt-8 block h-px bg-border-strong" />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-12 lg:col-span-8 lg:gap-0">
        {groups.map((group) => (
          <LitOnView key={group.key} className="about-skill-group relative min-w-0 pt-6 pb-4 lg:pb-16">
            <div className="flex items-baseline justify-between gap-4">
              <h4 className="about-reveal display max-w-[20ch] text-[clamp(1.8rem,3vw,2.75rem)] leading-none text-balance text-foreground">
                {group.label}
              </h4>
              <p className="font-mono text-xs text-subtle-foreground tabular-nums">
                {String(group.items.length).padStart(2, "0")}
              </p>
            </div>

            <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {group.items.map((item, index) => (
                <li
                  key={item}
                  className="about-reveal border-b border-border py-2.5 text-base leading-snug tracking-[-0.01em] text-muted-foreground lg:text-lg"
                  style={{ transitionDelay: `${Math.min(index, 5) * LAYER_STEP}s` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </LitOnView>
        ))}
      </div>
    </div>
  );
}
