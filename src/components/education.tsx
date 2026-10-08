import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Reveal } from "@/components/reveal";
import { SectionShell } from "@/components/section";
import { formatMonthYear } from "@/lib/dates";
import { getEducationBundle } from "@/lib/queries/education";

/**
 * Educacao agrupa formacao + certificacoes (decisao do plano); idiomas ficam
 * no bloco "sobre".
 */
export async function EducationSection() {
  const locale = await getLocale();
  const [tSections, tEducation, tCertifications, bundle] = await Promise.all([
    getTranslations("Sections"),
    getTranslations("Education"),
    getTranslations("Certifications"),
    getEducationBundle(locale),
  ]);

  return (
    <SectionShell id="education" number="05" title={tSections("education")}>
      <div className="flex flex-col">
        {bundle.educations.map((education, index) => (
          <Reveal key={education.id} delay={index * 0.05}>
            <article className="grid gap-6 border-t border-border py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
              <div>
                <h3 className="display text-[1.75rem] text-foreground">
                  {education.institution}
                </h3>
                <p className="mt-3 font-mono text-xs tracking-[0.18em] text-flow uppercase">
                  {education.degree}
                </p>
                <p className="mt-4 font-mono text-xs text-subtle-foreground">
                  {formatMonthYear(education.startDate, locale)}
                  {" – "}
                  {education.current
                    ? tEducation("present")
                    : education.endDate
                      ? formatMonthYear(education.endDate, locale)
                      : "—"}
                </p>
              </div>

              {education.description ? (
                <p className="max-w-[68ch] leading-7 text-muted-foreground">
                  {education.description}
                </p>
              ) : null}
            </article>
          </Reveal>
        ))}
        <div className="border-t border-border" aria-hidden="true" />
      </div>

      <div className="mt-16">
        <p className="hud-label">{tSections("certifications")}</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundle.certifications.map((certification) => {
            const issuedYear = certification.issuedAt
              ? formatMonthYear(certification.issuedAt, locale)
              : null;

            return (
              <li
                key={certification.id}
                className="border border-border bg-card/50 p-5 transition-none hover:border-flow"
              >
                <p className="font-mono text-sm font-semibold tracking-[0.08em] text-foreground uppercase">
                  {certification.name}
                </p>
                <p className="mt-2 font-mono text-xs text-subtle-foreground">
                  {certification.issuer}
                  {issuedYear ? ` · ${issuedYear}` : ""}
                </p>
                {certification.url ? (
                  <a
                    href={certification.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.18em] text-flare uppercase transition-none hover:text-flare-light"
                  >
                    {tCertifications("verify")}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
