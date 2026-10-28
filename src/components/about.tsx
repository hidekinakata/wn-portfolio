import { getLocale, getTranslations } from "next-intl/server";

import { LitOnView } from "@/components/lit-on-view";
import { ScrollLitText } from "@/components/scroll-lit-text";
import { SectionShell } from "@/components/section";
import { SkillBench } from "@/components/skill-bench";
import type { LanguageLevel } from "@/generated/prisma/enums";
import { getLanguages } from "@/lib/queries/education";
import { getProfile } from "@/lib/queries/profile";
import { skillGroups } from "@/lib/skills";

/** Segmentos do medidor por nivel: a ordem do enum, de basico a nativo. */
const METER_SEGMENTS = 4;
const levelSegments = {
  basic: 1,
  intermediate: 2,
  advanced: 3,
  native: 4,
} satisfies Record<LanguageLevel, number>;

/**
 * Sobre: bio do perfil (banco) que acende conforme a leitura, idiomas com
 * medidor de nivel e a bancada de competencias (strings proprias do
 * curriculo). Os grupos de skills nao traduzem nomes proprios.
 */
export async function AboutSection() {
  const locale = await getLocale();
  const [tSections, tSkills, tLevels, profile, languages] = await Promise.all([
    getTranslations("Sections"),
    getTranslations("Skills"),
    getTranslations("Levels"),
    getProfile(locale),
    getLanguages(locale),
  ]);

  const paragraphs = profile?.bio
    ? profile.bio
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

  const groups = skillGroups.map((group) => ({
    key: group.key,
    label: tSkills(group.key),
    items: group.items,
  }));
  const skillCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <SectionShell id="about" number="02" title={tSections("about")}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        {paragraphs.length > 0 ? (
          <ScrollLitText
            paragraphs={paragraphs}
            className="max-w-[40ch] text-[clamp(1.4rem,2.5vw,2.25rem)] leading-[1.3] tracking-[-0.012em] text-pretty lg:col-span-7 [&>p:not(:first-child)]:mt-3.5 [&>p:nth-child(2)]:mt-7 [&>p:not(:first-child)]:max-w-[62ch] [&>p:not(:first-child)]:text-base [&>p:not(:first-child)]:leading-7 [&>p:not(:first-child)]:tracking-normal"
          />
        ) : null}

        {/* Coluna de evidencia: skills primeiro (o que o recrutador procura),
            idiomas fecham. Em paisagem fica ao lado da bio, nao abaixo dela. */}
        <div className="flex flex-col gap-10 lg:col-span-5">
          <SkillBench
            title={tSkills("title")}
            idleReadout={tSkills("readoutIdle", {
              count: skillCount,
              groups: groups.length,
            })}
            groups={groups}
          />

          <LitOnView>
            <p className="hud-label border-t border-border-strong pt-4">
              {tSections("languages")}
            </p>
            <ul className="mt-4 flex flex-col">
              {languages.map((language) => (
                <li
                  key={language.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto_7.5rem] items-center gap-5 border-t border-border py-3.5 last:border-b"
                >
                  <span className="font-mono text-sm tracking-[0.12em] text-foreground uppercase">
                    {language.name}
                  </span>
                  <span aria-hidden="true" className="flex gap-1">
                    {Array.from({ length: METER_SEGMENTS }, (_, index) => (
                      <span
                        key={index}
                        className="lit-seg"
                        data-filled={index < levelSegments[language.levelKey]}
                        style={{ animationDelay: `${index * 110}ms` }}
                      />
                    ))}
                  </span>
                  <span className="hud-label text-right text-subtle-foreground">
                    {tLevels(language.levelKey)}
                  </span>
                </li>
              ))}
            </ul>
          </LitOnView>
        </div>
      </div>
    </SectionShell>
  );
}
