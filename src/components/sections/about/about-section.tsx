import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { LitOnView } from "@/components/motion/lit-on-view";
import { SectionShell } from "@/components/sections/shared/section-shell";
import { SkillBench } from "@/components/sections/about/skill-bench";
import type { LanguageLevel } from "@/generated/prisma/enums";
import { LAYER_STEP } from "@/lib/motion";
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
      <div className="flex flex-col gap-16">
        <div className="relative flex flex-col gap-8 lg:block lg:min-h-[34rem]">
          <div className="relative aspect-4/3 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_62%,transparent)] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[52%] lg:[mask-image:linear-gradient(to_bottom,#000_66%,transparent_100%)]">
            <Image
              src={portrait}
              alt={tSections("portraitAlt")}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_18%]"
            />
          </div>
          <div className="lg:relative lg:z-1 lg:max-w-[62%] lg:pt-4">
            {opening ? (
              <p className="text-[clamp(2rem,4vw,3.6rem)] leading-[1.05] font-light tracking-[-0.035em] text-balance text-foreground">
                {opening.first}
              </p>
            ) : null}
            {opening?.rest ? (
              <p className="mt-8 max-w-[52ch] text-base leading-[1.75] text-pretty text-muted-foreground lg:text-[1.0625rem]">
                {opening.rest}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 lg:absolute lg:right-0 lg:bottom-0 lg:z-1 lg:items-end lg:text-right">
            <p className="hud-label text-foreground">William Nakata</p>
            <p className="font-mono text-[0.72rem] leading-relaxed tracking-[0.16em] text-muted-foreground uppercase">
              {tHero("headline")}
            </p>
            <p className="hud-label text-subtle-foreground">
              {tStatus("value")}
            </p>
          </div>
        </div>

        <div className="about-workbench flex flex-col gap-16 lg:gap-24">
          {items.length > 0 ? (
            <dl>
              {items.map((item) => (
                <LitOnView
                  key={item.body}
                  className="about-specialty relative grid gap-6 py-8 lg:grid-cols-12 lg:gap-x-12 lg:py-12"
                >
                  {item.label ? (
                    <dt className="about-specialty-label self-start overflow-hidden lg:col-span-5">
                      <span className="about-reveal display block text-[clamp(2rem,3.8vw,3.5rem)] leading-[0.98] text-balance text-foreground">
                        {item.label}
                      </span>
                    </dt>
                  ) : null}
                  <dd
                    className={`about-reveal text-pretty ${
                      item.label
                        ? "max-w-[52ch] text-base leading-[1.8] text-muted-foreground lg:col-span-7 lg:pt-1 lg:text-lg"
                        : "max-w-[56ch] text-[clamp(1.25rem,2vw,1.65rem)] leading-[1.55] tracking-[-0.02em] text-foreground lg:col-span-10"
                    }`}
                    style={{ transitionDelay: `${LAYER_STEP}s` }}
                  >
                    {item.body}
                  </dd>
                </LitOnView>
              ))}
            </dl>
          ) : null}

          <SkillBench
            title={tSkills("title")}
            idleReadout={tSkills("readoutIdle", {
              count: skillCount,
              groups: groups.length,
            })}
            groups={groups}
          />

          {languages.length > 0 ? (
            <div className="grid gap-8 border-t border-border-strong pt-8 lg:grid-cols-12 lg:gap-12">
              <h3 className="display text-[clamp(2.25rem,3.5vw,3rem)] leading-none text-foreground lg:col-span-4">
                {tSections("languages")}
              </h3>
              <ul className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
                {languages.map((language) => (
                  <li key={language.id} className="min-w-0">
                    <LitOnView className="about-language">
                      <p className="about-reveal text-2xl leading-tight tracking-[-0.025em] text-foreground lg:text-3xl">
                        {language.name}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {tLevels(language.levelKey)}
                      </p>
                      <span aria-hidden="true" className="about-language-meter mt-5 flex gap-1.5">
                        {Array.from({ length: METER_SEGMENTS }, (_, index) => (
                          <span
                            key={index}
                            className="lit-seg"
                            data-filled={index < levelSegments[language.levelKey]}
                            style={{ animationDelay: `${index * LAYER_STEP}s` }}
                          />
                        ))}
                      </span>
                    </LitOnView>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}
