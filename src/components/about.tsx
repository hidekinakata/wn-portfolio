import { getLocale, getTranslations } from "next-intl/server";

import { Reveal } from "@/components/reveal";
import { SectionShell } from "@/components/section";
import { getLanguages } from "@/lib/queries/education";
import { getProfile } from "@/lib/queries/profile";
import { skillGroups } from "@/lib/skills";

/**
 * Sobre: bio do perfil (banco) + competencias (strings proprias do curriculo)
 * + idiomas com nivel. Os grupos de skills nao traduzem nomes proprios.
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

  return (
    <SectionShell id="about" number="02" title={tSections("about")}>
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div>
            {profile?.bio ? (
              <p className="max-w-[62ch] text-lg leading-8 text-foreground">
                {profile.bio}
              </p>
            ) : null}

            <div className="mt-12">
              <p className="hud-label">{tSkills("title")}</p>
              <div className="mt-6 flex flex-col gap-8">
                {skillGroups.map((group) => (
                  <div key={group.key} className="border-t border-border pt-5">
                    <p className="font-mono text-xs tracking-[0.18em] text-flow uppercase">
                      {tSkills(group.key)}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="font-mono text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="lg:pt-2">
            <p className="hud-label">{tSections("languages")}</p>
            <ul className="mt-6 flex flex-col">
              {languages.map((language) => (
                <li
                  key={language.id}
                  className="flex items-baseline justify-between gap-6 border-t border-border py-4 last:border-b"
                >
                  <span className="font-mono text-sm tracking-[0.12em] text-foreground uppercase">
                    {language.name}
                  </span>
                  <span className="hud-label text-subtle-foreground">
                    {tLevels(language.levelKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
