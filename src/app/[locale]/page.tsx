import { setRequestLocale } from "next-intl/server";

import { Hero } from "@/components/hero";
import { Skills } from "@/components/skills";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * Landing page unica: hero -> sobre -> experiencia -> projetos -> educacao.
 * As secoes ancoradas sao preenchidas com dados do banco na proxima fase.
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
      <Hero />
      <Skills />
    </>
  );
}
