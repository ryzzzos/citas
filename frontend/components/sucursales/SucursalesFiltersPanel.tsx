"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronRight, Compass, MapPin, Search, X } from "lucide-react";

import type { BusinessMapPoint } from "@/types";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SucursalesFiltersPanelProps {
  items: BusinessMapPoint[];
  loading: boolean;
  error: string | null;
  selectedBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
  requestingLocation: boolean;
  hasUserLocation: boolean;
  locationError: string | null;
  onRequestUserLocation: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "BS";
}

/* ── Avatar ─────────────────────────────────────────────────── */

function BusinessProfileAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const canRenderLogo = Boolean(logoUrl && logoUrl !== erroredLogoUrl);

  return (
    <div
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)]",
        "bg-[var(--surface-2)] border border-[var(--border-strong)]",
      )}
    >
      {canRenderLogo ? (
        <Image
          src={logoUrl as string}
          alt={`Logo de ${name}`}
          fill
          sizes="44px"
          className="object-cover"
          unoptimized
          onError={() => setErroredLogoUrl(logoUrl)}
        />
      ) : (
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[var(--text-muted)]">
          {toInitials(name)}
        </span>
      )}
    </div>
  );
}

/* ── PanelBody (shared between desktop & mobile) ───────────── */

function PanelBody({
  items,
  loading,
  selectedBusinessId,
  onSelectBusiness,
  requestingLocation,
  hasUserLocation,
  locationError,
  onRequestUserLocation,
}: Omit<SucursalesFiltersPanelProps, "mobileOpen" | "onMobileOpenChange" | "error">) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="shrink-0 px-1 pb-3">
        <h2 className="text-[1.35rem] font-extrabold tracking-tight text-[var(--text-primary)]">
          Explorar
        </h2>
        <p className="text-[0.78rem] text-[var(--text-muted)] mt-0.5 leading-snug">
          {loading
            ? "Buscando negocios..."
            : `${items.length} negocio${items.length !== 1 ? "s" : ""} en esta zona`}
        </p>
      </header>

      {/* ── LOCATION CHIP ──────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 pb-3 px-1">
        <button
          type="button"
          onClick={onRequestUserLocation}
          disabled={requestingLocation}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[0.75rem] font-semibold transition-all duration-200 disabled:opacity-60",
            hasUserLocation
              ? "bg-[color-mix(in_oklab,var(--color-success)_12%,transparent)] text-[var(--color-success)] border border-[var(--color-success)]/20"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)]",
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          {requestingLocation ? "..." : hasUserLocation ? "Cerca de mí" : "Mi ubicación"}
        </button>
      </div>

      {locationError && (
        <div className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-error)]/20 bg-[color-mix(in_oklab,var(--color-error)_6%,transparent)] px-3.5 py-2.5 text-[0.78rem] font-medium text-[var(--color-error)] mx-1 mb-3">
          {locationError}
        </div>
      )}

      {/* ── RESULTS LIST ───────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 space-y-1.5">
        {items.map((business) => {
          const active = selectedBusinessId === business.id;
          return (
            <button
              key={business.id}
              type="button"
              onClick={() => onSelectBusiness(business.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-[var(--radius-sm)] p-2.5 text-left transition-all duration-200 group",
                active
                  ? "bg-[color-mix(in_oklab,var(--app-primary)_8%,transparent)] border border-[var(--app-primary)]/25"
                  : "bg-transparent border border-transparent hover:bg-[var(--surface-2)]",
              )}
            >
              <BusinessProfileAvatar logoUrl={business.logo_image_url} name={business.name} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "truncate text-[0.88rem] font-semibold transition-colors",
                    active ? "text-[var(--app-primary)]" : "text-[var(--text-primary)] group-hover:text-[var(--app-primary)]",
                  )}>
                    {business.name}
                  </p>
                  {active && (
                    <span className="shrink-0 inline-block h-1.5 w-1.5 rounded-full bg-[var(--app-primary)]" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {business.category}
                  </span>
                  <span className="text-[var(--text-muted)] opacity-30">·</span>
                  <span className="truncate text-[0.72rem] text-[var(--text-muted)]">
                    {business.city}
                  </span>
                </div>
              </div>

              <ChevronRight className={cn(
                "h-4 w-4 shrink-0 transition-all duration-200",
                active
                  ? "text-[var(--app-primary)] opacity-100"
                  : "text-[var(--text-muted)] opacity-0 group-hover:opacity-50",
              )} />
            </button>
          );
        })}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--surface-2)] border border-[var(--border-strong)] mb-4">
              <Search className="h-5 w-5 text-[var(--text-muted)] opacity-40" />
            </div>
            <p className="text-[0.88rem] font-semibold text-[var(--text-primary)]">Sin resultados</p>
            <p className="text-[0.78rem] text-[var(--text-muted)] mt-1 max-w-[200px]">
              Mueve el mapa para descubrir otros negocios.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Export ────────────────────────────────────────────── */

export default function SucursalesFiltersPanel({
  items,
  loading,
  error,
  selectedBusinessId,
  onSelectBusiness,
  requestingLocation,
  hasUserLocation,
  locationError,
  onRequestUserLocation,
  mobileOpen,
  onMobileOpenChange,
}: SucursalesFiltersPanelProps) {
  const sharedPanelProps = {
    items,
    loading,
    selectedBusinessId,
    onSelectBusiness,
    requestingLocation,
    hasUserLocation,
    locationError,
    onRequestUserLocation,
  };

  return (
    <>
      {/* ── DESKTOP ASIDE ──────────────────────────────────── */}
      <aside
        className={cn(
          "pointer-events-auto absolute left-6 z-[460] hidden w-[min(380px,calc(100%-3rem))] min-h-0 rounded-[var(--radius-xl)] p-5 lg:flex flex-col",
          "top-[calc(env(safe-area-inset-top)+6.5rem)] h-[calc(100%-env(safe-area-inset-top)-8.5rem)]",
          "bg-[var(--surface-glass)] backdrop-blur-3xl backdrop-saturate-150 border border-[var(--glass-border)] shadow-[var(--glass-shadow)]",
        )}
      >
        <PanelBody {...sharedPanelProps} />
      </aside>

      {/* ── MOBILE TRIGGER ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className={cn(
          "dashboard-focusable pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-[0.85rem] font-semibold text-[var(--text-primary)] lg:hidden",
          "bg-[var(--surface-glass)] backdrop-blur-2xl backdrop-saturate-150 border border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-transform active:scale-95",
        )}
      >
        <Search className="h-4 w-4 text-[var(--app-primary)]" />
        Explorar
      </button>

      {/* ── MOBILE DRAWER ──────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[900] transition-opacity duration-300 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => onMobileOpenChange(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-label="Cerrar filtros"
        />

        <section
          className={cn(
            "absolute inset-x-2 bottom-2 top-[calc(env(safe-area-inset-top)+5rem)] flex min-h-0 flex-col rounded-[var(--radius-xl)] p-5 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileOpen ? "translate-y-0" : "translate-y-12",
            "bg-[var(--surface-glass)] backdrop-blur-3xl backdrop-saturate-150 border border-[var(--glass-border)] shadow-[var(--glass-shadow)]",
          )}
        >
          <div className="mb-3 flex items-center justify-end shrink-0">
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "dashboard-focusable inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)]",
                "bg-[var(--surface-2)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-all",
              )}
              aria-label="Cerrar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <PanelBody {...sharedPanelProps} />
          </div>
        </section>
      </div>
    </>
  );
}
