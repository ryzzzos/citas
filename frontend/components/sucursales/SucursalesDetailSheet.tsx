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
        "pointer-events-auto fixed bottom-4 left-4 right-4 z-[500] rounded-[1.85rem] p-4 lg:bottom-[max(env(safe-area-inset-bottom),1.25rem)] lg:left-auto lg:right-6 lg:top-auto lg:w-[420px] lg:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-6rem)] lg:overflow-y-auto",
        "glass-panel-heavy"
      )}
      aria-label="Detalle de sucursal"
    >
      <div className="relative">
        <div
          className="relative rounded-[1.35rem] border p-1"
          style={{
            borderColor: "var(--glass-border-default)",
            backgroundColor: "var(--glass-bg-base)",
          }}
        >
          <div className="relative overflow-hidden rounded-[1.1rem]">
            <div
              className="relative aspect-[16/9]"
              style={{
                background:
                  "linear-gradient(144deg, color-mix(in oklab, var(--dashboard-accent) 12%, var(--dashboard-surface-2) 88%) 0%, var(--glass-bg-soft) 100%)",
              }}
            >
              {canRenderCover ? (
                <Image
                  src={business.cover_image_url as string}
                  alt={`Portada de ${business.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-center"
                  unoptimized
                  onError={() => setErroredCoverUrl(business.cover_image_url)}
                />
              ) : null}

              <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-black/20 to-black/8" />

              <div className="absolute left-3 top-3 inline-flex min-h-8 items-center rounded-full border border-[color:var(--glass-border-soft)] bg-black/28 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
                {business.category}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "dashboard-focusable absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-100",
                  "glass-floating"
                )}
                aria-label="Cerrar detalle"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          </div>

          <div
            className={cn(
              "glass-floating-muted",
              "absolute -bottom-10 left-5 grid h-[4.75rem] w-[4.75rem] place-items-center overflow-hidden rounded-full border-2 p-0",
              "shadow-[0_22px_38px_-22px_rgba(2,6,23,0.74)]"
            )}
            style={{
              borderColor: "var(--dashboard-bg)",
              backgroundColor: "var(--glass-bg-soft)",
            }}
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
              <span
                className="text-sm font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--dashboard-text-secondary)" }}
              >
                {toInitials(business.name)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3
          className="text-[1.35rem] font-semibold tracking-tight"
          style={{ color: "var(--dashboard-text-primary)" }}
        >
          {business.name}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: "var(--dashboard-text-secondary)" }}>
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {business.address}, {business.city}
        </p>
      </div>

      <p className="mt-3 text-sm leading-6" style={{ color: "var(--dashboard-text-secondary)" }}>
        {business.public_bio?.trim() ||
          "Descubre su propuesta de valor, explora servicios destacados y conoce la experiencia completa en su perfil publico."}
      </p>

      <div className="mt-4">
        <Link
          href={`/${business.slug}`}
          className={cn(
            "dashboard-focusable inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold",
            "glass-floating"
          )}
          style={{ color: "var(--dashboard-text-primary)" }}
        >
          Ver perfil
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
