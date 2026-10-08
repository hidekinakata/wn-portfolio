import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { HeroField } from "@/components/hero-field";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * Hero da landing — primeiro viewport do console. O cargo (`headline`) e as
 * linhas de intro sao strings estaticas de traducao; o nome da marca e fixo
 * (uma linha, a adaptacao confirmada do brief).
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

      <div className="shell relative z-10 flex min-h-[100svh] flex-col justify-center pt-28 pb-32">
        <Reveal>
          <p className="hud-label text-flow-light">{t("eyebrow")}</p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="display mt-6 whitespace-nowrap text-[clamp(3.25rem,12.5vw,11.5rem)] leading-[0.88]">
            <span className="text-foreground">William</span>{" "}
            <span className="text-flow">Nakata</span>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="hud-label mt-8 text-foreground">{t("headline")}</p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-8 max-w-[52ch] font-mono text-sm leading-7 text-muted-foreground">
            <p>{t("introLine1")}</p>
            <p>{t("introLine2")}</p>
            <p>{t("introLine3")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
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
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-20 flex items-center gap-5">
            <span className="hud-label text-subtle-foreground">
              {status("currently")}
            </span>
            <span className="dot-leader flex-1" aria-hidden="true" />
            <span className="font-mono text-sm tracking-[0.22em] text-foreground">
              {status("value")}
            </span>
          </div>
        </Reveal>
      </div>

      <ScrollMarker labels={{ scroll: t("scroll"), explore: t("explore") }} />
    </section>
  );
}

/**
 * Marcador vertical SCROLL / EXPLORE do console. Os rotulos sao texto real;
 * os ticks sao chrome puro.
 */
function ScrollMarker({ labels }: { labels: { scroll: string; explore: string } }) {
  return (
    <div
      className="absolute top-1/2 right-8 hidden -translate-y-1/2 flex-col items-center gap-5 lg:flex"
      aria-hidden="true"
    >
      <span className="hud-label">{labels.scroll}</span>
      <span className="flex flex-col items-center gap-2">
        <span className="size-2 rounded-full border border-flow" />
        <span className="h-16 w-px bg-border-strong" />
        <span className="size-1 rounded-full bg-border-strong" />
        <span className="size-1 rounded-full bg-border-strong" />
        <span className="size-1 rounded-full bg-border-strong" />
      </span>
      <span className="hud-label">{labels.explore}</span>
    </div>
  );
}
