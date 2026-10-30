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

const dayFormatters: Record<string, Intl.DateTimeFormat> = {};

/**
 * Data completa de publicacao, `DD MMM YYYY`, tambem em UTC. Montada pelas
 * partes: o formato nativo varia por idioma ("10 de set. de 2025", "10 Sept
 * 2025") e o console quer a mesma forma nos dois.
 */
export function formatDay(date: Date, locale: string): string {
  const formatter =
    dayFormatters[locale] ??
    new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  dayFormatters[locale] = formatter;

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    formatter.formatToParts(date).find((entry) => entry.type === type)?.value ??
    "";

  return `${part("day")} ${part("month").replace(/\.$/, "")} ${part("year")}`;
}
