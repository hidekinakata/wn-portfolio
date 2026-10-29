import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { HeroField } from "@/components/sections/hero/hero-field";
import { LocalClock } from "@/components/layout/local-clock";
import { MaskedText } from "@/components/motion/masked-text";
import { TiltPermission } from "@/components/sections/hero/tilt-permission";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CHAR_STEP, LAYER_STEP } from "@/lib/motion";

/** Partitura da estreia, em segundos: nome, cargo, depois o corpo. */
const AT = { name: 0.06, role: 0.3, body: 0.55 } as const;

/**
 * Hero da landing — primeiro viewport do console. O cargo (`headline`) e as
 * linhas de intro sao strings estaticas de traducao; o nome da marca e fixo.
 * Renderizado no servidor (CSS puro): o momento autoral e o nome subindo
 * letra a letra de dentro da mascara, como o lockup da abertura; o cargo vem
 * palavra a palavra, o corpo assenta, os CTAs varrem como laminas e o campo
 * abre por tras. O marcador SCROLL / EXPLORE vive fora daqui (`ScrollMarker`).
 *
 * Altura: no desktop (lg+) o hero ocupa o viewport inteiro (100svh) e o
 * FeaturedProjects so aparece apos a dobra — a composicao de tela cheia pede
 * o campo de particulas sem cortes. Abaixo de lg o min-h deixa a faixa de
 * destaque espreitar a dobra de proposito: sem o rail nem o SCROLL marker
 * (ambos lg+), e ela o unico sinal de que ha conteudo abaixo.
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

      <div className="shell relative z-10 flex min-h-[min(calc(100svh-5rem),52rem)] flex-col justify-center pt-24 pb-14 lg:min-h-svh lg:pb-24">
        <p className="font-mono text-[0.78rem] tracking-[0.34em] text-muted-foreground uppercase">
          <MaskedText
            text={t("eyebrow")}
            split="word"
            pieceClassName="hero-char"
            step={LAYER_STEP}
            timing="animation"
          />
        </p>

        <h1 className="display mt-5">
          <span className="hero-name block whitespace-nowrap text-[clamp(3.5rem,10.5vw,10rem)] leading-[0.86] font-semibold">
            <MaskedText
              text="William Nakata"
              split="char"
              pieceClassName="hero-char"
              delay={AT.name}
              step={CHAR_STEP}
              timing="animation"
            />
          </span>
          <span className="hero-role mt-1 block pt-[0.14em] max-w-[15em] text-[clamp(1.9rem,5.4vw,5.25rem)] leading-[0.94] font-semibold text-balance">
            <MaskedText
              text={t("headline")}
              split="word"
              pieceClassName="hero-char"
              delay={AT.role}
              step={LAYER_STEP}
              timing="animation"
            />
          </span>
        </h1>

        <div
          className="hero-rise mt-10 max-w-[44rem] font-mono text-[0.72rem] leading-[1.95] tracking-[0.16em] text-foreground/80 uppercase lg:tracking-[0.24em] lg:whitespace-nowrap"
          style={{ animationDelay: `${AT.body}s` }}
        >
          {/* Tres linhas de console no desktop; no mobile viram um paragrafo corrido. */}
          <p className="inline lg:block">{t("introLine1")} </p>
          <p className="inline lg:block">{t("introLine2")} </p>
          <p className="inline lg:block">{t("introLine3")}</p>
        </div>

        {/* Os CTAs entram como laminas da cortina: varrem da esquerda. */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            asChild
            variant="console"
            size="console"
            className="hero-wipe"
            style={{ animationDelay: `${AT.body + LAYER_STEP}s` }}
          >
            <Link href="/#projects">
              {t("ctaProjects")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="keyline"
            size="console"
            className="hero-wipe"
            style={{ animationDelay: `${AT.body + 2 * LAYER_STEP}s` }}
          >
            <Link href="/#contact">
              {t("ctaContact")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div
          className="hero-rise mt-12 flex flex-col gap-2.5"
          style={{ animationDelay: `${AT.body + 3 * LAYER_STEP}s` }}
        >
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
