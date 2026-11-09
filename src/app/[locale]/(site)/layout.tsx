import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BootScreen } from "@/components/transitions/boot-screen";
import { RouteTransition } from "@/components/transitions/route-transition";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { BOOT_INIT_SCRIPT } from "@/lib/boot";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Hero" });
  return <>
    <script dangerouslySetInnerHTML={{ __html: BOOT_INIT_SCRIPT }} />
    <BootScreen role={t("headline")} />
    <RouteTransition />
    <SmoothScroll />
    <SiteHeader />
    <main id="main" className="flex-1">{children}</main>
    <SiteFooter />
  </>;
}
