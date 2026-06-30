"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, MapPin, X } from "lucide-react";

import type { BusinessMapPoint } from "@/types";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SucursalesDetailSheetProps {
  business: BusinessMapPoint | null;
  onClose: () => void;
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "BS";
}

export default function SucursalesDetailSheet({ business, onClose }: SucursalesDetailSheetProps) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const [erroredCoverUrl, setErroredCoverUrl] = useState<string | null>(null);

  if (!business) {
    return null;
  }

  const canRenderLogo = Boolean(
    business.logo_image_url && business.logo_image_url !== erroredLogoUrl,
  );
  const canRenderCover = Boolean(
    business.cover_image_url && business.cover_image_url !== erroredCoverUrl,
  );

  return (
    <section
      className={cn(
        "pointer-events-auto fixed bottom-4 left-4 right-4 z-[500] flex flex-col overflow-hidden rounded-[var(--radius-xl)]",
        "bg-[var(--surface-glass)] backdrop-blur-2xl backdrop-saturate-150 shadow-[var(--shadow-lg)] border border-[var(--border-soft)]",
        "h-[420px] lg:bottom-[max(env(safe-area-inset-bottom),1.5rem)] lg:left-auto lg:right-6 lg:top-auto lg:w-[400px] lg:h-[420px]"
      )}
      aria-label={`Detalle de sucursal: ${business.name}`}
    >
      <div className="relative h-48 w-full bg-[var(--surface-2)] shrink-0">
        {canRenderCover ? (
          <Image
            src={business.cover_image_url as string}
            alt={`Portada de ${business.name}`}
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-cover"
            unoptimized
            onError={() => setErroredCoverUrl(business.cover_image_url)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-3)]" />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full",
            "bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
          )}
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Category tag on the bottom-left of the cover photo */}
        <div className="absolute bottom-3 left-4">
          <span className="inline-block rounded-full bg-black/40 border border-white/10 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wider text-white backdrop-blur-md uppercase">
            {business.category}
          </span>
        </div>
      </div>

      {/* Profile Picture Overlay between Cover and Surface on the right */}
      <div className="absolute right-5 top-48 -translate-y-1/2 z-10">
        <div
          className={cn(
            "relative grid h-18 w-18 place-items-center overflow-hidden rounded-xl",
            "bg-[var(--surface-3)] shadow-[var(--shadow-md)] border-2 border-[var(--surface-3)]"
          )}
        >
          {canRenderLogo ? (
            <Image
              src={business.logo_image_url as string}
              alt={`Logo de ${business.name}`}
              fill
              sizes="72px"
              className="object-cover"
              unoptimized
              onError={() => setErroredLogoUrl(business.logo_image_url)}
            />
          ) : (
            <span className="text-base font-bold uppercase text-[var(--text-secondary)]">
              {toInitials(business.name)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 pt-7 justify-between min-w-0">
        <div className="min-w-0">
          <div className="pr-20">
            <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)] truncate" title={business.name}>
              {business.name}
            </h3>

            <p className="mt-1.5 flex items-center gap-1.5 text-[0.85rem] font-medium text-[var(--text-secondary)]">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{business.address}, {business.city}</span>
            </p>
          </div>

          <p className="mt-4 text-[0.85rem] leading-relaxed text-[var(--text-muted)] line-clamp-2">
            {business.public_bio?.trim() ||
              "Descubre su propuesta de valor, explora servicios destacados y conoce la experiencia completa en su perfil publico."}
          </p>
        </div>

        <Link
          href={`/${business.slug}?branch=${business.id}`}
          className={cn(
            "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full shrink-0",
            "bg-[var(--app-primary)] text-white shadow-sm transition-opacity hover:opacity-90"
          )}
        >
          <span className="text-[0.85rem] font-semibold">Ver perfil de la sucursal</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
