/**
 * Formato combinado de datas de educacao/experiencia: `MMM YYYY`.
 * Datas do banco sao DateTime em UTC; formatamos em UTC para nao deslocar mes.
 */

const formatters: Record<string, Intl.DateTimeFormat> = {};

function formatter(locale: string): Intl.DateTimeFormat {
  const existing = formatters[locale];
  if (existing) return existing;

  const created = new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  formatters[locale] = created;
  return created;
}

export function formatMonthYear(date: Date, locale: string): string {
  return formatter(locale).format(date);
}
