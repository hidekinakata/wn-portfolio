import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

/**
 * Proxy — no Next 16 a convencao `middleware` foi renomeada para `proxy`.
 *
 * Responsabilidades:
 *  - redirecionar `/` e caminhos sem prefixo para o locale correto;
 *  - escolher o melhor idioma na primeira visita via `Accept-Language`;
 *  - (fase 3) autenticar o `/admin` antes de qualquer renderizacao.
 */
export function proxy(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  // Ignora API routes, assets do Next e qualquer caminho com extensao de arquivo.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
