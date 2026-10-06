import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Navegacao ciente de locale. Use estes exports (e nao `next/link` /
 * `next/navigation` direto) em componentes do site para preservar o idioma.
 */
export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
