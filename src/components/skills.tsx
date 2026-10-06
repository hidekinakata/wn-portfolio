import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/reveal";
import { skillGroups } from "@/lib/skills";

/**
 * Grade de competencias. Os nomes proprios das tecnologias nao sao traduzidos
 * (vivem em `src/lib/skills.ts`); apenas os rotulos de grupo vem das mensagens.
 */
export async function Skills() {
  const t = await getTranslations("Skills");

  return (
    <section className="border-b border-border" aria-labelledby="skills-title">
      <div className="shell py-16 sm:py-20">
        <Reveal>
          <h2 id="skills-title" className="eyebrow">
            {t("title")}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, index) => (
            <Reveal key={group.key} delay={index * 0.06}>
              <h3 className="font-mono text-sm text-foreground">
                {t(group.key)}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
