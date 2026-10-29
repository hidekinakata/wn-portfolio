import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

/**
 * 404 do console: o codigo em tipo display ocupa o viewport, com a mesma
 * entrada em foco do hero. Serve tanto para `notFound()` quanto para
 * caminhos sem rota (via `[...rest]/page.tsx`).
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
            className="hero-focus block text-[clamp(9rem,34vw,30rem)] leading-[0.8] font-semibold text-lavender"
          >
            404
          </span>
          <span className="hero-focus mt-3 block text-[clamp(1.9rem,5.4vw,4.5rem)] leading-[0.94] font-semibold text-balance [animation-delay:140ms]">
            {t("title")}
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
