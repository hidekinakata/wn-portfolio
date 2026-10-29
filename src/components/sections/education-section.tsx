import { ArrowUpRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { EntryDescription } from "@/components/sections/shared/entry-description";
import { LitOnView } from "@/components/motion/lit-on-view";
import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "@/components/sections/shared/section-shell";
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
      {/* Formacoes lado a lado em paisagem: cada uma e curta, empilhadas
          deixariam metade da largura vazia. */}
      <div className="grid gap-x-14 lg:grid-cols-2">
        {bundle.educations.map((education, index) => (
          <Reveal key={education.id} delay={index * 0.05}>
            <article className="h-full border-t border-border py-7">
              <h3 className="display text-[1.75rem] text-foreground">
                {education.institution}
              </h3>
              <p className="mt-2.5 font-mono text-xs tracking-[0.18em] text-flow uppercase">
                {education.degree}
              </p>
              <p className="mt-3 font-mono text-xs text-subtle-foreground">
                {formatMonthYear(education.startDate, locale)}
                {" – "}
                {education.current
                  ? tEducation("present")
                  : education.endDate
                    ? formatMonthYear(education.endDate, locale)
                    : "—"}
              </p>

              {education.description ? (
                <div className="mt-4">
                  <EntryDescription text={education.description} />
                </div>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 border-t border-border-strong pt-6">
        <p className="hud-label">{tSections("certifications")}</p>
        <LitOnView className="mt-5">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bundle.certifications.map((certification, index) => {
              const issuedYear = certification.issuedAt
                ? formatMonthYear(certification.issuedAt, locale)
                : null;

              return (
                <li
                  key={certification.id}
                  className="card-in border border-border bg-card/50 p-4 transition-none hover:border-flow"
                  style={{ animationDelay: `${index * 70}ms` }}
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
                      className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-[0.18em] text-flare uppercase transition-none hover:text-flare-light"
                    >
                      {tCertifications("verify")}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </LitOnView>
      </div>
    </SectionShell>
  );
}
