import Image from "next/image";

import { LitOnView } from "@/components/motion/lit-on-view";

import portrait from "../../../../public/avatar/portrait.jpg";

type IdentityPlateProps = {
  alt: string;
  name: string;
  role: string;
  location: string;
};

/**
 * Placa de identidade do Sobre: o retrato em moldura de hairline com cantos
 * lavanda, e a legenda em mono ao lado. Acende com `LitOnView`: a imagem abre
 * da esquerda para a direita e os cantos assentam depois.
 */
export function IdentityPlate({
  alt,
  name,
  role,
  location,
}: IdentityPlateProps) {
  return (
    <LitOnView className="flex items-end gap-5 sm:flex-col sm:items-start sm:gap-4">
      <div className="relative size-32 shrink-0 border border-border-strong p-1.5 sm:size-40">
        <div className="lit-plate-img size-full overflow-hidden">
          <Image
            src={portrait}
            alt={alt}
            sizes="(min-width: 640px) 160px, 128px"
            className="size-full origin-[50%_38%] scale-150 object-cover"
          />
        </div>
        <span
          aria-hidden="true"
          className="lit-tick -top-1 -left-1 border-t border-l"
        />
        <span
          aria-hidden="true"
          className="lit-tick -right-1 -bottom-1 border-r border-b"
          style={{ transformOrigin: "bottom right" }}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-2 pb-1 sm:pb-0">
        <p className="hud-label text-foreground">{name}</p>
        <p className="font-mono text-[0.72rem] leading-relaxed tracking-[0.16em] text-muted-foreground uppercase">
          {role}
        </p>
        <p className="hud-label text-subtle-foreground">{location}</p>
      </div>
    </LitOnView>
  );
}
