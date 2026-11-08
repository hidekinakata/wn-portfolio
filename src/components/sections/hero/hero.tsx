import { ArrowRight } from "lucide-react";
import { Bebas_Neue } from "next/font/google";
import { getTranslations } from "next-intl/server";

import { LocalClock } from "@/components/layout/local-clock";
import { MaskedText } from "@/components/motion/masked-text";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { CHAR_STEP, LAYER_STEP } from "@/lib/motion";

/** Partitura da estreia, em segundos: nome, cargo, depois o corpo. */
const AT = { name: 0.06, role: 0.3, body: 0.55 } as const;

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

/**
 * Hero da landing — primeiro viewport do console. O cargo (`headline`) e as
 * linhas de intro sao strings estaticas de traducao; o nome da marca e fixo.
 * Renderizado no servidor (CSS puro): o momento autoral e o nome subindo
 * letra a letra de dentro da mascara, como o lockup da abertura; o cargo vem
 * palavra a palavra, o corpo assenta e os CTAs varrem como laminas.
 * O marcador SCROLL / EXPLORE vive fora daqui (`ScrollMarker`).
 *
 * Composicao: no desktop o nome e escalonado — WILLIAM a esquerda, NAKATA
 * empurrado a direita — e o cargo ocupa o vao ao lado de NAKATA, de modo que
 * o proprio nome preenche o lado direito. Abaixo de lg tudo empilha, com
 * NAKATA alinhado a direita.
 *
 * Altura: no desktop (lg+) o hero ocupa o viewport inteiro (100svh) e o
 * FeaturedProjects so aparece apos a dobra. Abaixo de lg o min-h deixa a faixa de
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
      <div className="shell relative flex min-h-[min(calc(100svh-5rem),52rem)] flex-col justify-center pt-24 pb-14 lg:min-h-svh lg:pb-24">
        <p className="font-mono text-[0.78rem] tracking-[0.34em] text-muted-foreground uppercase">
          <MaskedText
            text={t("eyebrow")}
            split="word"
            pieceClassName="hero-char"
            step={LAYER_STEP}
            timing="animation"
          />
        </p>

        <h1
          className="display mt-5 font-normal [font-synthesis:none] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-baseline-last"
          style={{ fontFamily: bebasNeue.style.fontFamily }}
        >
          <span className="hero-line block whitespace-nowrap leading-[0.86] text-foreground lg:col-span-full lg:row-start-1">
            <MaskedText
              text="William"
              split="char"
              pieceClassName="hero-char"
              delay={AT.name}
              step={CHAR_STEP}
              timing="animation"
            />
          </span>{" "}
          <span className="hero-line block text-right whitespace-nowrap leading-[0.86] text-foreground lg:col-start-2 lg:row-start-2">
            <MaskedText
              text="Nakata"
              split="char"
              pieceClassName="hero-char"
              delay={AT.name + 7 * CHAR_STEP}
              step={CHAR_STEP}
              timing="animation"
            />
          </span>{" "}
          <span className="hero-role mt-4 block max-w-[14em] leading-none tracking-normal text-balance text-violet lg:col-start-1 lg:row-start-2 lg:mt-0 lg:pr-8">
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

        <div className="mt-[1.8rem] grid grid-cols-1 items-end gap-x-10 gap-y-[1.6rem] lg:grid-cols-[minmax(0,1fr)_auto]">
          <div
            className="hero-rise @container/hero-intro min-w-0 max-w-[34rem] font-mono text-sm leading-[1.8] tracking-[0.06em] text-pretty text-foreground/80 uppercase"
            style={{ animationDelay: `${AT.body}s` }}
          >
            {/* As tres frases so se separam quando a coluna tem largura suficiente. */}
            <p className="inline @lg/hero-intro:block">{t("introLine1")} </p>
            <p className="inline @lg/hero-intro:block">{t("introLine2")} </p>
            <p className="inline @lg/hero-intro:block">{t("introLine3")}</p>
          </div>

          {/* Os CTAs entram como laminas da cortina: varrem da esquerda. */}
          <div className="grid grid-cols-1 gap-3 sm:w-fit sm:grid-cols-2 sm:gap-4">
            <Button
              asChild
              variant="console"
              size="console"
              className="hero-wipe shadow-none focus-visible:ring-lavender focus-visible:ring-offset-4 focus-visible:ring-offset-background"
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
              className="hero-wipe focus-visible:ring-lavender focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              style={{ animationDelay: `${AT.body + 2 * LAYER_STEP}s` }}
            >
              <Link href="/#contact">
                {t("ctaContact")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div
          className="hero-foot hero-rise relative mt-[1.8rem] flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
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
        </div>
      </div>
    </section>
  );
}
