import { ArrowUpRight, Download } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";
import { SectionShell } from "@/components/sections/shared/section-shell";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/queries/profile";

/**
 * Contato: o fim do caminho do visitante. Somente links (decisao do produto) —
 * sem formulario. Os links vem do perfil no banco; rotulos em mono + seta,
 * sem icones de marca (a voz do console e texto).
 */
export async function ContactSection() {
  const locale = await getLocale();
  const [tNav, tContact, profile] = await Promise.all([
    getTranslations("Nav"),
    getTranslations("Contact"),
    getProfile(locale),
  ]);

  return (
    <SectionShell id="contact" number="06" title={tContact("title")}>
      {/* Frase e links na mesma linha em paisagem: o fim do caminho cabe na
          tela em vez de empilhar duas faixas. */}
      <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <p className="font-mono text-sm text-muted-foreground">
          {tContact("body")}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {profile?.email ? (
            <Button asChild variant="keyline" size="console">
              <a href={`mailto:${profile.email}`}>
                {tContact("email")}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ) : null}

          {profile?.github ? (
            <Button asChild variant="keyline" size="console">
              <a href={profile.github} target="_blank" rel="noreferrer">
                {tContact("github")}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ) : null}

          {profile?.linkedin ? (
            <Button asChild variant="keyline" size="console">
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                {tContact("linkedin")}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
          ) : null}

          {profile?.cvUrl ? (
            <Button asChild variant="console" size="console">
              <a href={profile.cvUrl} target="_blank" rel="noreferrer">
                {tNav("cv")}
                <Download aria-hidden="true" />
              </a>
            </Button>
          ) : null}
        </div>
      </Reveal>
    </SectionShell>
  );
}
