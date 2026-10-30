import { LAYER_STEP } from "@/lib/motion";

const SEGMENTS = 8;
const MINUTES_PER_SEGMENT = 2;

type ReadingMeterProps = {
  minutes: number;
  /** Atraso base do acendimento, em segundos. */
  delay?: number;
};

/**
 * Medidor de duracao de leitura: oito segmentos de dois minutos, apagados os
 * que faltam (o mesmo vocabulario do medidor de idiomas). O texto com os
 * minutos vive ao lado, por isso o medidor e `aria-hidden`.
 */
export function ReadingMeter({ minutes, delay = 0 }: ReadingMeterProps) {
  const filled = Math.min(
    SEGMENTS,
    Math.max(1, Math.ceil(minutes / MINUTES_PER_SEGMENT)),
  );

  return (
    <span aria-hidden="true" className="flex gap-[3px]">
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <span
          key={index}
          className="lit-seg w-2.5"
          data-filled={index < filled}
          style={{ animationDelay: `${(delay + index * LAYER_STEP).toFixed(3)}s` }}
        />
      ))}
    </span>
  );
}
