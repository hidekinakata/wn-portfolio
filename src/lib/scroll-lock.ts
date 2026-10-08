/**
 * Trava/destrava o scroll da pagina (overlays como o menu mobile). O
 * `overflow` cobre o caso sem Lenis (reduced motion); o evento avisa o
 * `SmoothScroll` para parar/retomar o Lenis.
 */
export const SCROLL_LOCK_EVENT = "wn:scroll-lock";

export function setScrollLock(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  window.dispatchEvent(
    new CustomEvent<boolean>(SCROLL_LOCK_EVENT, { detail: locked }),
  );
}
