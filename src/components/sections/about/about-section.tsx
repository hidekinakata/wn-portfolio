import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { LitOnView } from "@/components/motion/lit-on-view";
import { SectionShell } from "@/components/sections/shared/section-shell";
import { SkillBench } from "@/components/sections/about/skill-bench";
import type { LanguageLevel } from "@/generated/prisma/enums";
import { getLanguages } from "@/lib/queries/education";
import { getProfile } from "@/lib/queries/profile";
import { skillGroups } from "@/lib/skills";
import {
  splitFirstSentence,
  splitLabel,
  stripLeadingPictograph,
} from "@/lib/text";

import portrait from "../../../../public/avatar/portrait-cutout.png";

/** Segmentos do medidor por nivel: a ordem do enum, de basico a nativo. */
const METER_SEGMENTS = 4;
const levelSegments = {
  basic: 1,
  intermediate: 2,
  advanced: 3,
  native: 4,
} satisfies Record<LanguageLevel, number>;

/**
 * Sobre: placa de identidade e bio do perfil (banco), idiomas com
 * medidor de nivel e a bancada de competencias (strings proprias do
 * curriculo). Os grupos de skills nao traduzem nomes proprios.
 */
export async function AboutSection() {
  const locale = await getLocale();
  const [tSections, tHero, tStatus, tSkills, tLevels, profile, languages] =
    await Promise.all([
      getTranslations("Sections"),
      getTranslations("Hero"),
      getTranslations("Status"),
      getTranslations("Skills"),
      getTranslations("Levels"),
      getProfile(locale),
      getLanguages(locale),
    ]);

  // Primeiro paragrafo abre em corpo grande; os demais viram itens com rotulo.
  const [lead, ...details] = (profile?.bio ?? "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const opening = lead ? splitFirstSentence(lead) : null;
  const items = details.map((detail) =>
    splitLabel(stripLeadingPictograph(detail))
  );

  const groups = skillGroups.map((group) => ({
    key: group.key,
    label: tSkills(group.key),
    items: group.items,
  }));
  const skillCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <SectionShell id="about" number="02" title={tSections("about")}>
      <div className="about-stack">
        <div className="about-hero">
          <div className="about-hero-portrait">
            <Image
              src={portrait}
              alt={tSections("portraitAlt")}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_18%]"
            />
          </div>
          <div className="about-hero-copy">
            {opening ? (
              <p className="about-hero-lead font-light text-balance text-foreground">
                {opening.first}
              </p>
            ) : null}
            {opening?.rest ? (
              <p className="mt-8 max-w-[52ch] text-base leading-[1.75] text-pretty text-muted-foreground lg:text-[1.0625rem]">
                {opening.rest}
              </p>
            ) : null}
          </div>
          <div className="about-hero-caption">
            <p className="hud-label text-foreground">William Nakata</p>
            <p className="font-mono text-[0.72rem] leading-relaxed tracking-[0.16em] text-muted-foreground uppercase">
              {tHero("headline")}
            </p>
            <p className="hud-label text-subtle-foreground">
              {tStatus("value")}
            </p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-7">
            {items.length > 0 ? (
              <dl className="border-b border-border">
                {items.map((item) => (
                  <div
                    key={item.body}
                    className="grid gap-2.5 border-t border-border py-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-8"
                  >
                    {item.label ? (
                      <dt className="hud-label pt-[0.4em] leading-[1.5] text-foreground">
                        {item.label}
                      </dt>
                    ) : null}
                    <dd
                      className={`text-[0.9375rem] leading-[1.7] text-pretty text-muted-foreground ${
                        item.label ? "" : "sm:col-start-2"
                      }`}
                    >
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

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
      </div>
    </SectionShell>
  );
}
