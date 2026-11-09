import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

/**
 * Proxy — no Next 16 a convencao `middleware` foi renomeada para `proxy`.
 *
 * Responsabilidades:
 *  - redirecionar `/` e caminhos sem prefixo para o locale correto;
 *  - escolher o melhor idioma na primeira visita via `Accept-Language`;
 *  - atualizar cookies do admin (autorizacao tambem em cada action).
 */
export async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (/^\/(?:en|pt-BR)\/admin(?:\/|$)/.test(request.nextUrl.pathname) && url && key) {
    const client = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (entries, headers) => {
          for (const { name, value, options } of entries) {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
        },
      },
    });
    await client.auth.getUser();
    response.headers.set("x-middleware-request-cookie", request.cookies.toString());
    const overrides = response.headers.get("x-middleware-override-headers");
    response.headers.set("x-middleware-override-headers", [overrides, "cookie"].filter(Boolean).join(","));
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  // Ignora API routes, assets do Next e qualquer caminho com extensao de arquivo.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
