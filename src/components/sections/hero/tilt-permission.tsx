"use client";

import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type RequestPermission = () => Promise<"granted" | "denied">;

/** Tempo para o sensor se manifestar sozinho antes de oferecer o pedido. */
const SENSOR_GRACE_MS = 1200;

/**
 * iOS (13+) so entrega `deviceorientation` depois de um pedido explicito
 * feito num gesto do usuario.
 */
function getRequestPermission(): RequestPermission | null {
  const ctor: unknown = window.DeviceOrientationEvent;
  if (typeof ctor !== "function" || !("requestPermission" in ctor)) return null;
  const request = ctor.requestPermission;
  if (typeof request !== "function") return null;
  return async () => {
    const result: unknown = await request.call(ctor);
    return result === "granted" ? "granted" : "denied";
  };
}

/**
 * Botao discreto que libera a inclinacao do aparelho como ponteiro do campo
 * do hero. So aparece quando o sensor fica mudo sem permissao (iOS): se uma
 * leitura chega sozinha (Android), ele nunca e mostrado.
 */
export function TiltPermission({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const eligible =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      getRequestPermission() !== null;
    if (!eligible) return;

    let sensorAlive = false;
    const onReading = (event: DeviceOrientationEvent) => {
      if (event.beta === null) return;
      sensorAlive = true;
      setVisible(false);
      window.removeEventListener("deviceorientation", onReading);
    };
    window.addEventListener("deviceorientation", onReading);
    const timer = window.setTimeout(() => {
      if (!sensorAlive) setVisible(true);
    }, SENSOR_GRACE_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("deviceorientation", onReading);
    };
  }, []);

  if (!visible) return null;

  const enable = async () => {
    const request = getRequestPermission();
    try {
      if (request) await request();
    } catch {
      // Recusa ou falha do navegador: o campo segue so com o ponteiro.
    } finally {
      // Concedida ou negada, o pedido nao se repete na mesma visita.
      setVisible(false);
    }
  };

  return (
    <button
      type="button"
      onClick={enable}
      className="mt-4 flex h-11 w-fit items-center gap-2.5 border border-border-strong px-3.5 font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase transition-none hover:border-lavender hover:text-lavender focus-visible:border-lavender focus-visible:text-lavender"
    >
      <Smartphone aria-hidden="true" className="size-3.5" />
      {label}
    </button>
  );
}
