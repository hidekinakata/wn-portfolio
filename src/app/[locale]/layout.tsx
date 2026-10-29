import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";

import { BootScreen } from "@/components/transitions/boot-screen";
import { RouteTransition } from "@/components/transitions/route-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { BOOT_INIT_SCRIPT } from "@/lib/boot";
import { routing } from "@/i18n/routing";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Voz de display do console: grotesca industrial condensada e alta (nome,
   secoes). Variavel com eixo optico, que vai para o corte display em tamanho
   grande. */
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  // O Next nao tem metricas de fallback para "Big Shoulders" (familia nova
  // no Google Fonts) e avisaria a cada compilacao. O nome em display fica
  // atras de um fallback condensado do sistema enquanto a fonte carrega.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Roboto Condensed", "sans-serif"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Obrigatorio com Cache Components: o segmento raiz `[locale]` precisa declarar
 * ao menos um valor. Aqui pre-renderizamos o shell estatico de cada idioma;
 * rotas internas desconhecidas caem no `notFound()` abaixo.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Root layout — fica sob o segmento dinâmico `[locale]`, o padrao oficial de
 * internacionalizacao do Next (nao existe `app/layout.tsx`).
 */
export async function generateMetadata({
  params,
}: Pick<Props, "params">): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: "#060810",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }
  const locale = localeParam;

  // Habilita renderizacao estatica dos Server Components neste layout.
  setRequestLocale(locale);

  const messages = await getMessages();
  const hero = await getTranslations({ locale, namespace: "Hero" });

  return (
    <html
      lang={locale}
      // O script inline do boot marca `data-boot` no `<html>` antes da
      // hidratacao; sem isto o React acusaria mismatch de atributos.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bigShoulders.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        {/* Antes de qualquer conteudo: marca `data-boot` no `<html>` antes do
            overlay de loading pintar (ver `src/lib/boot.ts`). */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_INIT_SCRIPT }} />
        <NextIntlClientProvider messages={messages}>
          <BootScreen role={hero("headline")} />
          <RouteTransition />
          <SmoothScroll />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
