import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AboutSection } from "@/components/sections/about/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { EducationSection } from "@/components/sections/education-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { FeaturedProjects } from "@/components/sections/projects/featured-projects";
import { Hero } from "@/components/sections/hero/hero";
import { ProjectsSection } from "@/components/sections/projects/projects-section";
import { ScrollMarker } from "@/components/navigation/scroll-marker";
import { SectionRail } from "@/components/navigation/section-rail";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Landing unica: hero -> destaque -> sobre -> experiencia -> projetos ->
 * educacao -> contato. O shell e estatico; as secoes driven-by-DB renderizam
 * sob `Suspense`.
 */
export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }
  const locale = localeParam;

  setRequestLocale(locale);

  return (
    <>
      <SectionRail />
      <ScrollMarker />
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedProjects />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ExperienceSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ProjectsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <EducationSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ContactSection />
      </Suspense>
    </>
  );
}

/** Placeholder de altura estavel enquanto a secao carrega. */
function SectionFallback() {
  return (
    <div
      aria-busy="true"
      className="min-h-[16rem] border-b border-border"
      role="status"
    />
  );
}
