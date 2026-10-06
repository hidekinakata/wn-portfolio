import type { NextConfig } from "next";

/**
 * next-intl configurado **sem** `createNextIntlPlugin`.
 *
 * Por que: `next-intl/plugin` faz `require('@swc/core')` no topo do modulo —
 * usado apenas pelos recursos `experimental.extract` e `messages.precompile`
 * (que nao usamos). O addon nativo do `@swc/core` e um "carrier" que materializa
 * o binario num cache de usuario e recusa carregar quando um outro SID tem
 * direitos de escrita na cadeia de diretorios (erro `ERR_SWC_NATIVE_CACHE`).
 * Isso quebrava o `next dev` por completo.
 *
 * Para o uso basico, o plugin faz uma unica coisa: apontar o alias
 * `next-intl/config` para o request config. Ver `resolveI18nPath` em
 * `node_modules/next-intl/dist/cjs/development/plugin.cjs` — o caminho retornado
 * e relativo, com forward slashes.
 *
 * Se um dia precisarmos de `extract`/`precompile`, basta substituir o bloco de
 * aliases por:
 *
 *   import createNextIntlPlugin from "next-intl/plugin";
 *   export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
 */
const requestConfigPath = "./src/i18n/request.ts";

const nextConfig: NextConfig = {
  /**
   * Modelo de cache do Next 16 (substitui `ppr`/`useCache`/`dynamicIO`).
   * As queries sao marcadas com `'use cache'` + `cacheTag`/`cacheLife` em
   * `src/lib/queries/*`, e as mutations do admin usam `updateTag`.
   */
  cacheComponents: true,

  turbopack: {
    resolveAlias: {
      "next-intl/config": requestConfigPath,
    },
  },

  // Cobertura para quem builda com webpack (`next build --webpack`).
  webpack(config) {
    config.resolve ??= {};
    const alias = config.resolve.alias ?? {};
    if (!Array.isArray(alias)) {
      alias["next-intl/config"] = requestConfigPath;
    }
    config.resolve.alias = alias;
    return config;
  },
};

export default nextConfig;
