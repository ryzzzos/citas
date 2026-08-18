"use client";

import Image from "next/image";
import { useState } from "react";
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
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("") || "BS"
  );
}

/* ── Business List Item (High-Contrast Layered Card) ──────────── */

function BusinessListItem({
  business,
  isActive,
  onSelect,
}: {
  business: BusinessMapPoint;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const canRenderLogo = Boolean(
    business.logo_image_url && business.logo_image_url !== erroredLogoUrl
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3.5 p-3 rounded-[var(--radius-lg)] text-left transition-all duration-200 group relative",
        // Pure elevated surface-3 card on top of surface-1/2 background
        "bg-[var(--surface-3)]",
        isActive
          ? "border-2 border-[var(--app-primary)] shadow-[var(--shadow-md)] ring-2 ring-[var(--app-primary)]/15"
          : "border border-[var(--border-strong)] shadow-[var(--shadow-sm)] hover:border-[var(--app-primary)]/50 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
      )}
    >
      {/* Avatar / Logo Cutout */}
      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-strong)] shadow-inner">
        {canRenderLogo ? (
          <Image
            src={business.logo_image_url as string}
            alt={`Logo de ${business.name}`}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
            onError={() => setErroredLogoUrl(business.logo_image_url)}
          />
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {toInitials(business.name)}
          </span>
        )}
      </div>

      {/* Info Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <p
            className={cn(
              "truncate text-sm font-bold transition-colors",
              isActive
                ? "text-[var(--app-primary)]"
                : "text-[var(--text-primary)] group-hover:text-[var(--app-primary)]"
            )}
          >
            {business.name}
          </p>
          {isActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--app-primary)] text-white shrink-0 shadow-xs">
              Activo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-block rounded-full bg-[var(--surface-1)] border border-[var(--border-strong)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
            {business.category}
          </span>
          <span className="truncate text-xs text-[var(--text-muted)] font-medium flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-error)]" />
            <span className="truncate">{business.city}</span>
          </span>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 transition-all duration-200",
          isActive
            ? "text-[var(--app-primary)] translate-x-0.5"
            : "text-[var(--text-muted)] opacity-40 group-hover:opacity-100 group-hover:text-[var(--app-primary)] group-hover:translate-x-0.5"
        )}
      />
    </button>
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
      <header className="shrink-0 pb-3.5 border-b border-[var(--border-strong)]/60 mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Explorar sucursales
          </h2>
          <span className="inline-flex items-center rounded-full bg-[var(--surface-3)] border border-[var(--border-strong)] px-2.5 py-0.5 text-xs font-bold text-[var(--text-primary)] shadow-xs">
            {loading ? "..." : items.length}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
          {loading
            ? "Cargando sucursales cercanas..."
            : `${items.length} negocio${items.length !== 1 ? "s" : ""} disponible${items.length !== 1 ? "s" : ""} en la zona`}
        </p>
      </header>

      {/* ── LOCATION CHIP ──────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 pb-3">
        <button
          type="button"
          onClick={onRequestUserLocation}
          disabled={requestingLocation}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-60",
            hasUserLocation
              ? "bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-[var(--color-success)] border border-[var(--color-success)]/30 shadow-xs"
              : "bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-1)] shadow-[var(--shadow-sm)]"
          )}
        >
          <Compass className="h-3.5 w-3.5 text-[var(--app-primary)]" />
          {requestingLocation
            ? "Ubicando..."
            : hasUserLocation
            ? "Cerca de mí"
            : "Usar mi ubicación"}
        </button>
      </div>

      {locationError && (
        <div className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-error)]/25 bg-[color-mix(in_oklab,var(--color-error)_8%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--color-error)] mb-3 shadow-xs">
          {locationError}
        </div>
      )}

      {/* ── RESULTS LIST (Cards with elevation) ────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1 hide-scrollbar">
        {items.map((business) => (
          <BusinessListItem
            key={business.id}
            business={business}
            isActive={selectedBusinessId === business.id}
            onSelect={() => onSelectBusiness(business.id)}
          />
        ))}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-[var(--radius-lg)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-xs">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-1)] border border-[var(--border-strong)] mb-3">
              <Search className="h-5 w-5 text-[var(--text-muted)] opacity-60" />
            </div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Sin sucursales en esta vista
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-[220px]">
              Mueve el mapa o amplía el zoom para descubrir otros negocios.
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
      {/* ── DESKTOP ASIDE (Layered Surface-1 / Surface-2 Container) ── */}
      <aside
        className={cn(
          "pointer-events-auto absolute left-6 z-[460] hidden w-[min(380px,calc(100%-3rem))] min-h-0 rounded-[var(--radius-xl)] p-5 lg:flex flex-col",
          "top-[calc(env(safe-area-inset-top)+6.5rem)] h-[calc(100%-env(safe-area-inset-top)-8.5rem)]",
          "bg-[var(--surface-2)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]"
        )}
      >
        <PanelBody {...sharedPanelProps} />
      </aside>

      {/* ── MOBILE / TABLET FLOATING TRIGGER ───────────────── */}
      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className={cn(
          "dashboard-focusable pointer-events-auto fixed top-[calc(env(safe-area-inset-top)+5.25rem)] left-4 z-[450] inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-bold text-[var(--text-primary)] lg:hidden",
          "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] transition-all duration-200 hover:bg-[var(--surface-2)] active:scale-95"
        )}
      >
        <Search className="h-3.5 w-3.5 text-[var(--app-primary)]" />
        <span>Lista ({items.length})</span>
      </button>

      {/* ── MOBILE & TABLET DRAWER ─────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[900] transition-opacity duration-300",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={() => onMobileOpenChange(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          aria-label="Cerrar panel de sucursales"
        />

        {/* Sheet Container: Bottom sheet on mobile (< sm), Slide-over drawer on tablet (sm to lg) */}
        <section
          className={cn(
            "absolute z-10 flex min-h-0 flex-col transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "bg-[var(--surface-2)] border-[var(--border-strong)] shadow-2xl",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 top-[18vh] rounded-t-[var(--radius-2xl)] border-t p-4 pb-6 sm:inset-y-0 sm:left-0 sm:right-auto sm:w-[380px] sm:rounded-r-[var(--radius-2xl)] sm:rounded-tl-none sm:border-t-0 sm:border-r sm:p-5",
            mobileOpen
              ? "translate-y-0 sm:translate-x-0"
              : "translate-y-full sm:translate-y-0 sm:-translate-x-full"
          )}
        >
          {/* Mobile Drag Handle */}
          <div className="mx-auto -mt-1 mb-2.5 h-1 w-10 rounded-full bg-[var(--border-strong)] sm:hidden" />

          {/* Top Bar with Close Button */}
          <div className="mb-2 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Directorio
            </span>
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "dashboard-focusable inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)]",
                "bg-[var(--surface-3)] border border-[var(--border-strong)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-all shadow-xs"
              )}
              aria-label="Cerrar lista de sucursales"
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


