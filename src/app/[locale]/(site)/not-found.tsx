import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { MaskedText } from "@/components/motion/masked-text";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { LAYER_STEP } from "@/lib/motion";

/**
 * 404 do console: o codigo em tipo display ocupa o viewport, subindo de
 * dentro da mascara com o mesmo gesto do nome no hero. Serve tanto para
 * `notFound()` quanto para caminhos sem rota (via `[...rest]/page.tsx`).
 */
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="hairline-grid pointer-events-none absolute inset-0 -z-10 opacity-20"
      />
      <div className="shell flex min-h-svh flex-col justify-center pt-24 pb-14">
        <p className="font-mono text-[0.78rem] tracking-[0.34em] text-muted-foreground uppercase">
          {t("eyebrow")}
        </p>

        <h1 className="display mt-5">
          <span
            aria-hidden="true"
            className="block text-[clamp(9rem,34vw,30rem)] leading-[0.8] font-semibold text-lavender"
          >
            {/* Pecas decorativas: o titulo abaixo e o texto acessivel. */}
            <span className="mask-line">
              {Array.from("404").map((char, index) => (
                <span
                  key={index}
                  className="hero-char"
                  style={{ animationDelay: `${0.1 + index * LAYER_STEP}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </span>
          <span className="mt-3 block text-[clamp(1.9rem,5.4vw,4.5rem)] leading-[0.94] font-semibold text-balance">
            <MaskedText
              text={t("title")}
              split="word"
              pieceClassName="hero-char"
              delay={0.4}
              step={LAYER_STEP}
              timing="animation"
            />
          </span>
        </h1>

        <p className="mt-8 max-w-[34rem] font-mono text-[0.72rem] leading-[1.95] tracking-[0.16em] text-foreground/80 uppercase">
          {t("description")}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild variant="console" size="console">
            <Link href="/">
              {t("home")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="keyline" size="console">
            <Link href="/blog">
              {t("blog")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
