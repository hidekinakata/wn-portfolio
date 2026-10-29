"use client";

import { useSyncExternalStore } from "react";

const TIME_ZONE = "America/Sao_Paulo";
const TICKS = 6;

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}

function getSnapshot() {
  return formatter.format(Date.now());
}

function getServerSnapshot() {
  return null;
}

/**
 * Hora local de William (GMT-3), em leitura de telemetria: o relogio troca a
 * cada segundo e a fileira de pontos acende em degraus — salto de dado, sem
 * tween. Antes da hidratacao mostra o estado apagado.
 */
export function LocalClock() {
  const time = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const seconds = time === null ? -1 : Number(time.slice(-2));
  const lit = seconds < 0 ? 0 : (seconds % TICKS) + 1;

  return (
    <span className="flex items-center gap-4">
      <time
        className="font-mono text-[0.72rem] tracking-[0.22em] text-foreground tabular-nums"
        suppressHydrationWarning
      >
        {time ?? "--:--:--"}
      </time>
      <span className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, index) => (
          <span
            key={index}
            className={
              index < lit
                ? "size-1.5 rounded-full bg-signal"
                : "size-1.5 rounded-full bg-ghost"
            }
          />
        ))}
      </span>
    </span>
  );
}
