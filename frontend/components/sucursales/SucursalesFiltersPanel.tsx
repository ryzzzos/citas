"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronRight, Compass, Search, SlidersHorizontal, X } from "lucide-react";

import type { BusinessMapPoint } from "@/types";
import type { DiscoveryFilters } from "@/components/sucursales/types";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type SortMode = "viewport" | "name-asc" | "name-desc" | "category";

interface SucursalesFiltersPanelProps {
  filters: DiscoveryFilters;
  onFiltersChange: (nextFilters: DiscoveryFilters) => void;
  items: BusinessMapPoint[];
  viewportItems: BusinessMapPoint[];
  total: number;
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

const CATEGORY_PREVIEW_LIMIT = 6;

function toInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("") || "BS";
}

/* ── Avatar ─────────────────────────────────────────────────── */

function BusinessProfileAvatar({ logoUrl, name, size = "md" }: { logoUrl: string | null; name: string; size?: "sm" | "md" }) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const canRenderLogo = Boolean(logoUrl && logoUrl !== erroredLogoUrl);

  const sizeClasses = size === "sm"
    ? "h-11 w-11 rounded-[var(--radius-sm)]"
    : "h-12 w-12 rounded-[var(--radius-sm)]";

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden",
        "bg-[var(--surface-2)] border border-[var(--border-strong)]",
        sizeClasses,
      )}
    >
      {canRenderLogo ? (
        <Image
          src={logoUrl as string}
          alt={`Logo de ${name}`}
          fill
          sizes={size === "sm" ? "44px" : "48px"}
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
  filters,
  onFiltersChange,
  items,
  loading,
  selectedBusinessId,
  onSelectBusiness,
  requestingLocation,
  hasUserLocation,
  locationError,
  onRequestUserLocation,
  nameQuery,
  onNameQueryChange,
  sortMode,
  onSortModeChange,
  filtersExpanded,
  onToggleFilters,
  filtersRegionId,
  onClearAll,
}: Omit<SucursalesFiltersPanelProps, "mobileOpen" | "onMobileOpenChange" | "error" | "total"> & {
  nameQuery: string;
  onNameQueryChange: (val: string) => void;
  sortMode: SortMode;
  onSortModeChange: (val: SortMode) => void;
  filtersExpanded: boolean;
  onToggleFilters: () => void;
  filtersRegionId: string;
  onClearAll: () => void;
}) {
  const categories = useMemo(() => {
    const pool = new Set<string>(items.map((item) => item.category));
    if (filters.category) {
      pool.add(filters.category);
    }
    return ["", ...Array.from(pool).sort((a, b) => a.localeCompare(b, "es"))];
  }, [filters.category, items]);

  const categorySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
      .slice(0, CATEGORY_PREVIEW_LIMIT);
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = nameQuery.trim().toLocaleLowerCase("es");
    let nextItems =
      normalizedQuery.length === 0
        ? items
        : items.filter((business) => {
            const searchable = `${business.name} ${business.category} ${business.city}`.toLocaleLowerCase("es");
            return searchable.includes(normalizedQuery);
          });

    if (sortMode === "viewport") return nextItems;

    nextItems = [...nextItems];
    if (sortMode === "name-asc") {
      nextItems.sort((a, b) => a.name.localeCompare(b.name, "es"));
      return nextItems;
    }
    if (sortMode === "name-desc") {
      nextItems.sort((a, b) => b.name.localeCompare(a.name, "es"));
      return nextItems;
    }
    nextItems.sort((a, b) => a.category.localeCompare(b.category, "es") || a.name.localeCompare(b.name, "es"));
    return nextItems;
  }, [items, nameQuery, sortMode]);

  const hasActiveFilters = filters.category || filters.city || sortMode !== "viewport";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="shrink-0 px-1 pb-4">
        <h2 className="text-[1.35rem] font-extrabold tracking-tight text-[var(--text-primary)]">
          Explorar
        </h2>
        <p className="text-[0.78rem] text-[var(--text-muted)] mt-0.5 leading-snug">
          {loading
            ? "Buscando negocios..."
            : `${filteredItems.length} negocio${filteredItems.length !== 1 ? "s" : ""} en esta zona`}
        </p>
      </header>

      {/* ── SEARCH ─────────────────────────────────────────── */}
      <div className="shrink-0 px-1 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={nameQuery}
            onChange={(event) => onNameQueryChange(event.target.value)}
            placeholder="Buscar negocio, categoría..."
            className={cn(
              "w-full rounded-[var(--radius-sm)] border bg-[var(--surface-2)] py-2.5 pl-10 pr-10 text-[0.85rem] text-[var(--text-primary)] outline-none transition-all duration-200",
              "border-[var(--border-strong)] placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/12",
            )}
          />
          {nameQuery.trim() && (
            <button
              type="button"
              onClick={() => onNameQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── CHIPS ──────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-3 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={onToggleFilters}
          aria-expanded={filtersExpanded}
          aria-controls={filtersRegionId}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[0.75rem] font-semibold transition-all duration-200",
            filtersExpanded
              ? "bg-[var(--app-primary)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)]",
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </button>

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

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex shrink-0 items-center rounded-full px-3 py-[7px] text-[0.7rem] font-semibold text-[var(--color-error)] bg-[color-mix(in_oklab,var(--color-error)_8%,transparent)] border border-[var(--color-error)]/15 hover:bg-[color-mix(in_oklab,var(--color-error)_14%,transparent)] transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ── EXPANDABLE FILTERS ─────────────────────────────── */}
      <div
        id={filtersRegionId}
        className={cn(
          "shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          filtersExpanded ? "max-h-[500px] opacity-100 pb-3" : "max-h-0 opacity-0",
        )}
      >
        <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--border-strong)] p-4 mx-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Ciudad
              </span>
              <input
                type="text"
                value={filters.city}
                onChange={(event) => onFiltersChange({ ...filters, city: event.target.value })}
                placeholder="Ej: Medellín"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-[0.82rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] placeholder:text-[var(--text-muted)]"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Categoría
              </span>
              <select
                value={filters.category}
                onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-[0.82rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category || "all"} value={category}>
                    {category || "Todas"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Ordenar
            </span>
            <select
              value={sortMode}
              onChange={(event) => onSortModeChange(event.target.value as SortMode)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-[0.82rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] cursor-pointer"
            >
              <option value="viewport">Mapa visible</option>
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
              <option value="category">Categoría</option>
            </select>
          </label>

          {categorySummary.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {categorySummary.map(([category, count]) => {
                const active = filters.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onFiltersChange({ ...filters, category: active ? "" : category })}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition-all duration-200",
                      active
                        ? "bg-[var(--app-primary)] text-white"
                        : "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {category}
                    <span className={cn("text-[0.6rem]", active ? "opacity-80" : "opacity-50")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {locationError && (
        <div className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-error)]/20 bg-[color-mix(in_oklab,var(--color-error)_6%,transparent)] px-3.5 py-2.5 text-[0.78rem] font-medium text-[var(--color-error)] mx-1 mb-3">
          {locationError}
        </div>
      )}

      {/* ── RESULTS LIST ───────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 space-y-1.5">
        {filteredItems.map((business) => {
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
              <BusinessProfileAvatar logoUrl={business.logo_image_url} name={business.name} size="sm" />

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

        {!loading && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--surface-2)] border border-[var(--border-strong)] mb-4">
              <Search className="h-5 w-5 text-[var(--text-muted)] opacity-40" />
            </div>
            <p className="text-[0.88rem] font-semibold text-[var(--text-primary)]">Sin resultados</p>
            <p className="text-[0.78rem] text-[var(--text-muted)] mt-1 max-w-[200px]">
              {nameQuery.trim()
                ? "No encontramos negocios con esa búsqueda."
                : "Mueve el mapa para descubrir otros negocios."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Export ────────────────────────────────────────────── */

export default function SucursalesFiltersPanel({
  filters,
  onFiltersChange,
  items,
  viewportItems,
  total,
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
  const [nameQuery, setNameQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("viewport");
  const [desktopFiltersExpanded, setDesktopFiltersExpanded] = useState(false);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  const activeFiltersCount = useMemo(() => {
    const normalizedCity = filters.city.trim();
    const normalizedCategory = filters.category.trim();
    const normalizedQuery = nameQuery.trim();

    return (
      Number(normalizedCity.length > 0) +
      Number(normalizedCategory.length > 0) +
      Number(normalizedQuery.length > 0) +
      Number(sortMode !== "viewport")
    );
  }, [filters.category, filters.city, nameQuery, sortMode]);

  const handleClearAll = () => {
    onFiltersChange({ city: "", category: "" });
    setNameQuery("");
    setSortMode("viewport");
  };

  const sharedPanelProps = {
    filters,
    onFiltersChange,
    items,
    viewportItems,
    loading,
    selectedBusinessId,
    onSelectBusiness,
    requestingLocation,
    hasUserLocation,
    locationError,
    onRequestUserLocation,
    nameQuery,
    onNameQueryChange: setNameQuery,
    sortMode,
    onSortModeChange: setSortMode,
    onClearAll: handleClearAll,
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
        <PanelBody
          {...sharedPanelProps}
          filtersExpanded={desktopFiltersExpanded}
          onToggleFilters={() => setDesktopFiltersExpanded((current) => !current)}
          filtersRegionId="sucursales-filters-controls-desktop"
        />
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
        {activeFiltersCount > 0 && (
          <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--app-primary)] px-1.5 text-[0.65rem] font-bold text-white">
            {activeFiltersCount}
          </span>
        )}
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
            <PanelBody
              {...sharedPanelProps}
              filtersExpanded={mobileFiltersExpanded}
              onToggleFilters={() => setMobileFiltersExpanded((current) => !current)}
              filtersRegionId="sucursales-filters-controls-mobile"
            />
          </div>
        </section>
      </div>
    </>
  );
}
