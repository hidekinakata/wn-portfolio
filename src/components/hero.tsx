import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { HeroField } from "@/components/hero-field";
import { LocalClock } from "@/components/local-clock";
import { TiltPermission } from "@/components/tilt-permission";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Hero da landing — primeiro viewport do console. O cargo (`headline`) e as
 * linhas de intro sao strings estaticas de traducao; o nome da marca e fixo.
 * Renderizado no servidor e visivel desde o primeiro paint: o unico movimento
 * autoral e o nome entrando em foco (CSS), os campos chegam depois. O
 * marcador SCROLL / EXPLORE vive fora daqui (`ScrollMarker`, fixo na pagina).
 */
export async function Hero() {
  const t = await getTranslations("Hero");
  const status = await getTranslations("Status");

  return (
    <section
      id="home"
      className="relative isolate scroll-mt-20 overflow-hidden border-b border-border"
    >
      <HeroField />

      <div className="shell relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-center pt-28 pb-20">
        <p className="font-mono text-[0.78rem] tracking-[0.34em] text-muted-foreground uppercase">
          {t("eyebrow")}
        </p>

        <h1 className="display mt-5">
          <span className="hero-name hero-focus block whitespace-nowrap text-[clamp(3.5rem,10.5vw,10rem)] leading-[0.86] font-semibold">
            William Nakata
          </span>
          <span className="hero-role hero-focus mt-1 block pt-[0.14em] max-w-[15em] text-[clamp(1.9rem,5.4vw,5.25rem)] leading-[0.94] font-semibold text-balance [animation-delay:140ms]">
            {t("headline")}
          </span>
        </h1>

        <div className="mt-10 max-w-[44rem] font-mono text-[0.72rem] leading-[1.95] tracking-[0.16em] text-foreground/80 uppercase lg:tracking-[0.24em] lg:whitespace-nowrap">
          {/* Tres linhas de console no desktop; no mobile viram um paragrafo corrido. */}
          <p className="inline lg:block">{t("introLine1")} </p>
          <p className="inline lg:block">{t("introLine2")} </p>
          <p className="inline lg:block">{t("introLine3")}</p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild variant="console" size="console">
            <Link href="/#projects">
              {t("ctaProjects")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="keyline" size="console">
            <Link href="/#contact">
              {t("ctaContact")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-16 flex flex-col gap-2.5">
          <span className="hud-label text-foreground">{status("currently")}</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[0.72rem] tracking-[0.22em] text-muted-foreground uppercase">
              {status("value")}
            </span>
            <span aria-hidden="true" className="hidden h-px w-6 bg-border-strong sm:block" />
            <LocalClock />
          </span>
          <div className="lg:hidden">
            <TiltPermission label={t("tiltEnable")} />
          </div>
        </div>
      </div>
    </section>
  );
}
