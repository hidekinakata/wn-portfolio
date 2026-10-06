import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // `undefined` acontece em requisicoes sem cookie de locale (ex.: bots/curl).
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
