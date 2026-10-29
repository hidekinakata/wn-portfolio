/**
 * Mecanismo da cortina de abertura (intro de primeira visita e troca de
 * idioma).
 *
 * O overlay (`#boot-screen`) e renderizado pelo servidor, mas so aparece
 * quando este script inline marca `data-boot="on"` no `<html>` — antes do
 * overlay ser pintado. Dois casos: a primeira visita de cada sessao, e a
 * chegada de uma troca de idioma (`SWITCH_STORAGE_KEY`, deixado pela pagina
 * anterior: o layout raiz muda com o locale, entao o Next faz carga completa
 * e a cortina precisa chegar ja fechada). Nunca com `prefers-reduced-motion`
 * ou sem `sessionStorage`. Sem JS o overlay nunca aparece: o conteudo esta
 * sempre la.
 *
 * O mesmo atributo pausa a estreia do hero (ver `globals.css`), que so roda
 * quando o painel sai. O `setTimeout` e o cinto de seguranca caso a
 * hidratacao do React nunca aconteca.
 */
export const BOOT_STORAGE_KEY = "wn:booted";
export const SWITCH_STORAGE_KEY = "wn:switch";

export const BOOT_INIT_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var switching = sessionStorage.getItem("${SWITCH_STORAGE_KEY}");
    sessionStorage.removeItem("${SWITCH_STORAGE_KEY}");
    if (reduced) {
      root.dataset.boot = "off";
      return;
    }
    if (switching || !sessionStorage.getItem("${BOOT_STORAGE_KEY}")) {
      root.dataset.boot = "on";
      root.dataset.bootKind = switching ? "switch" : "first";
    } else {
      // Recarga na mesma sessao: sem abertura, mas a estreia do hero espera a
      // hidratacao (BootScreen) para nao nascer pela metade.
      root.dataset.boot = "wait";
    }
    // Cinto de seguranca caso o React nunca hidrate: folga para a abertura
    // inteira (~2s) caber ate num dispositivo lento. O fim normal e o
    // proprio componente (boot-screen.tsx) quem fecha.
    setTimeout(function () {
      root.dataset.boot = "off";
    }, 6000);
  } catch (e) {
    document.documentElement.dataset.boot = "off";
  }
})();
`;
