"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scroll global via Lenis.
 *
 * - Respeita `prefers-reduced-motion` (sem Lenis nesse caso).
 * - Intercepta cliques em ancoras da mesma pagina (`#secao`) para que a
 *   navegacao do menu seja suave, compensando a altura do header fixo.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const HEADER_OFFSET = -80;

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const hash = url.hash.slice(1);
      if (!hash) return;

      // So intercepta quando a ancora esta na pagina atual.
      const isSamePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (!isSamePage) return;

      const element = document.getElementById(hash);
      if (!element) return;

      event.preventDefault();
      lenis.scrollTo(element, { offset: HEADER_OFFSET });
      window.history.replaceState(null, "", `#${hash}`);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
