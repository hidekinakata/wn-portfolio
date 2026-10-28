import { getLocale, getTranslations } from "next-intl/server";

import { EntryDescription } from "@/components/entry-description";
import { Reveal } from "@/components/reveal";
import { SectionShell } from "@/components/section";
import { formatMonthYear } from "@/lib/dates";
import { getExperiences } from "@/lib/queries/experience";

/**
 * Experiencia: linhas de hairline com cargo traduzido, empresa em display e
 * periodo em mono. O periodo usa o formato combinado `MMM YYYY`.
 */
export async function ExperienceSection() {
  const locale = await getLocale();
  const [tSections, tExperience, experiences] = await Promise.all([
    getTranslations("Sections"),
    getTranslations("Experience"),
    getExperiences(locale),
  ]);

  return (
    <SectionShell id="experience" number="03" title={tSections("experience")}>
      <div className="flex flex-col">
        {experiences.map((experience, index) => (
          <Reveal key={experience.id} delay={index * 0.05}>
            <article className="grid gap-4 border-t border-border py-7 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
              <div>
                <h3 className="display text-[1.75rem] text-foreground">
                  {experience.company}
                </h3>
                <p className="mt-2.5 font-mono text-xs tracking-[0.18em] text-flow uppercase">
                  {experience.position}
                </p>
                <p className="mt-3 font-mono text-xs text-subtle-foreground">
                  {formatMonthYear(experience.startDate, locale)}
                  {" – "}
                  {experience.current
                    ? tExperience("present")
                    : experience.endDate
                      ? formatMonthYear(experience.endDate, locale)
                      : "—"}
                </p>
              </div>

              {experience.description ? (
                <EntryDescription text={experience.description} />
              ) : null}
            </article>
          </Reveal>
        ))}
        <div className="border-t border-border" aria-hidden="true" />
      </div>
    </SectionShell>
  );
}
