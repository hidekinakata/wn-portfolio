import { notFound } from "next/navigation";

/** Esta rota sempre responde 404: nao ha shell estatico a validar. */
export const instant = false;

/** Caminhos sem rota dentro de um locale caem no `not-found.tsx` localizado. */
export default function CatchAllPage() {
  notFound();
}
