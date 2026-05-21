"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

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

function BusinessProfileAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  const [erroredLogoUrl, setErroredLogoUrl] = useState<string | null>(null);
  const canRenderLogo = Boolean(logoUrl && logoUrl !== erroredLogoUrl);

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-3)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)]",
        "relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-xl)]"
      )}
    >
      {canRenderLogo ? (
        <Image
          src={logoUrl as string}
          alt={`Logo de ${name}`}
          fill
          sizes="56px"
          className="object-cover"
          unoptimized
          onError={() => setErroredLogoUrl(logoUrl)}
        />
      ) : (
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.05em] text-[var(--app-primary)]">
          {toInitials(name)}
        </span>
      )}
    </div>
  );
}

function PanelBody({
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

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-1">
      {/* QUICK SEARCH & CONTROLS */}
      <header className="shrink-0 flex flex-col gap-3">
        <div className="flex flex-col mb-1 px-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            Descubre lugares <Sparkles className="h-5 w-5 text-[var(--app-primary)]" />
          </h2>
          <p className="text-[0.8rem] text-[var(--text-muted)] mt-0.5">Encuentra los mejores negocios cerca de ti</p>
        </div>

        <div className="relative group">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--app-primary)] opacity-70 group-focus-within:opacity-100 transition-opacity" />
          <input
            type="text"
            value={nameQuery}
            onChange={(event) => onNameQueryChange(event.target.value)}
            placeholder="¿Qué estás buscando hoy?"
            className="w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface-3)] py-4 pl-11 pr-12 text-[0.92rem] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] outline-none transition-all duration-300 focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-primary)]/10 placeholder:text-[var(--text-muted)] hover:shadow-[var(--shadow-md)]"
          />
          {nameQuery.trim() && (
            <button
              type="button"
              onClick={() => onNameQueryChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--surface-1)] rounded-full p-1 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersExpanded}
            aria-controls={filtersRegionId}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[0.8rem] font-bold transition-all duration-300 shadow-[var(--shadow-sm)]",
              filtersExpanded
                ? "bg-[var(--app-primary)] text-white shadow-[var(--shadow-md)] scale-[1.02]"
                : "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>

          <button
            type="button"
            onClick={onRequestUserLocation}
            disabled={requestingLocation}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[0.8rem] font-bold transition-all duration-300 disabled:opacity-70 shadow-[var(--shadow-sm)]",
              hasUserLocation
                ? "bg-[color-mix(in_oklab,var(--app-primary)_15%,transparent)] text-[var(--app-primary-strong)] border border-[var(--app-primary)]/30"
                : "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
            )}
          >
            <MapPin className="h-4 w-4" />
            {requestingLocation ? "Buscando..." : hasUserLocation ? "Cerca de mí" : "Ubicación"}
          </button>

          {(filters.category || filters.city || sortMode !== "viewport") ? (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex shrink-0 items-center rounded-full bg-[var(--surface-2)] border border-[var(--border-strong)] px-3.5 py-2.5 text-[0.75rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors shadow-sm"
            >
              Limpiar
            </button>
          ) : null}
        </div>
      </header>

      {/* EXPANDABLE FILTERS */}
      <div
        id={filtersRegionId}
        className={cn(
          "shrink-0 flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          filtersExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-[var(--radius-xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] p-4 shadow-[var(--shadow-md)] grid grid-cols-1 sm:grid-cols-2 gap-4 mx-1">
          <label className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Ciudad
            <input
              type="text"
              value={filters.city}
              onChange={(event) => onFiltersChange({ ...filters, city: event.target.value })}
              placeholder="Ej: Santiago"
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2.5 text-[0.9rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] focus:bg-[var(--surface-3)] placeholder:text-[var(--text-muted)]"
            />
          </label>

          <label className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Categoría
            <select
              value={filters.category}
              onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2.5 text-[0.9rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] focus:bg-[var(--surface-3)] cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category || "all"} value={category}>
                  {category || "Todas"}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Ordenar por
            <select
              value={sortMode}
              onChange={(event) => onSortModeChange(event.target.value as SortMode)}
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] px-3 py-2.5 text-[0.9rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--app-primary)] focus:bg-[var(--surface-3)] cursor-pointer"
            >
              <option value="viewport">Visibles en el mapa (Recomendado)</option>
              <option value="name-asc">Nombre A-Z</option>
              <option value="name-desc">Nombre Z-A</option>
              <option value="category">Categoría</option>
            </select>
          </label>

          {categorySummary.length > 0 && (
            <div className="sm:col-span-2 mt-2">
              <div className="flex flex-wrap gap-2">
                {categorySummary.map(([category, count]) => {
                  const active = filters.category === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onFiltersChange({ ...filters, category: active ? "" : category })}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.75rem] font-bold transition-all duration-200",
                        active
                          ? "bg-[var(--app-primary)] text-white shadow-[var(--shadow-sm)] scale-105"
                          : "bg-[var(--surface-1)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {category} <span className="opacity-70 ml-0.5 text-[0.65rem] bg-black/10 px-1.5 rounded-full">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {locationError && (
        <div className="shrink-0 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[color-mix(in_oklab,var(--color-error)_10%,transparent)] px-4 py-3 text-[0.8rem] font-medium text-[var(--color-error)] mx-1 shadow-[var(--shadow-sm)]">
          {locationError}
        </div>
      )}

      {/* RESULTS LIST */}
      <section className="flex min-h-0 flex-1 flex-col rounded-[var(--radius-xl)] bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] mx-1 mt-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border-strong)] px-5 py-4 shrink-0 bg-[var(--surface-2)]/50">
          <p className="text-[0.85rem] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
            Resultados
          </p>
          <div className="inline-flex items-center rounded-full bg-[var(--surface-3)] px-3 py-1 shadow-sm border border-[var(--border-strong)]">
            <span className="text-[0.7rem] font-bold text-[var(--app-primary)]">
              {loading ? "..." : `${filteredItems.length} negocios`}
            </span>
          </div>
        </div>

        <ul className="h-full min-h-0 flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredItems.map((business) => {
            const active = selectedBusinessId === business.id;
            return (
              <li key={business.id}>
                <button
                  type="button"
                  onClick={() => onSelectBusiness(business.id)}
                  className={cn(
                    "w-full rounded-[var(--radius-lg)] p-3 text-left transition-all duration-300 group",
                    active
                      ? "bg-[var(--surface-1)] border-2 border-[var(--app-primary)] shadow-[var(--shadow-sm)]"
                      : "bg-[var(--surface-3)] border-2 border-transparent hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <BusinessProfileAvatar logoUrl={business.logo_image_url} name={business.name} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[1rem] font-bold text-[var(--text-primary)] group-hover:text-[var(--app-primary)] transition-colors">
                          {business.name}
                        </p>
                        {active && (
                          <span className="shrink-0 inline-flex items-center justify-center h-5 px-2 rounded-full bg-[var(--app-primary)] text-white text-[0.6rem] font-bold tracking-wider uppercase shadow-[var(--shadow-sm)]">
                            Viendo
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {business.category}
                      </p>

                      <p className="mt-1 truncate text-[0.8rem] text-[var(--text-muted)] flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {business.city} • {business.address}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}

          {!loading && filteredItems.length === 0 ? (
            <li className="flex flex-col items-center justify-center p-10 text-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--surface-2)] border-2 border-dashed border-[var(--border-strong)]">
                <Search className="h-6 w-6 text-[var(--text-muted)] opacity-50" />
              </div>
              <div>
                <p className="text-[0.95rem] font-bold text-[var(--text-primary)]">Sin resultados</p>
                <p className="text-[0.8rem] text-[var(--text-secondary)] mt-1 max-w-[200px] mx-auto">
                  {nameQuery.trim()
                    ? "No encontramos nada con esa búsqueda."
                    : "Intenta mover el mapa a otra zona."}
                </p>
              </div>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

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

  return (
    <>
      {/* DESKTOP ASIDE */}
      <aside
        className={cn(
          "pointer-events-auto absolute left-6 z-[460] hidden w-[min(420px,calc(100%-3rem))] min-h-0 rounded-[var(--radius-xl)] p-4 lg:flex flex-col",
          "top-[calc(env(safe-area-inset-top)+6.5rem)] h-[calc(100%-env(safe-area-inset-top)-8.5rem)]",
          "bg-[var(--surface-glass)] backdrop-blur-3xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
        )}
      >
        <PanelBody
          filters={filters}
          onFiltersChange={onFiltersChange}
          items={items}
          viewportItems={viewportItems}
          loading={loading}
          selectedBusinessId={selectedBusinessId}
          onSelectBusiness={onSelectBusiness}
          requestingLocation={requestingLocation}
          hasUserLocation={hasUserLocation}
          locationError={locationError}
          onRequestUserLocation={onRequestUserLocation}
          nameQuery={nameQuery}
          onNameQueryChange={setNameQuery}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          filtersExpanded={desktopFiltersExpanded}
          onToggleFilters={() => setDesktopFiltersExpanded((current) => !current)}
          filtersRegionId="sucursales-filters-controls-desktop"
          onClearAll={handleClearAll}
        />
      </aside>

      {/* MOBILE TRIGGER */}
      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className={cn(
          "dashboard-focusable pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] inline-flex min-h-14 items-center gap-2.5 rounded-full px-6 text-[0.9rem] font-bold text-[var(--text-primary)] lg:hidden",
          "bg-[var(--surface-glass)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-transform active:scale-95"
        )}
      >
        <Search className="h-5 w-5 text-[var(--app-primary)]" />
        Explorar lugares
        {activeFiltersCount > 0 && (
          <span className="ml-1 grid h-6 min-w-6 place-items-center rounded-full bg-[var(--app-primary)] px-2 text-[0.7rem] font-bold text-white shadow-sm">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-[900] transition-opacity duration-300 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => onMobileOpenChange(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          aria-label="Cerrar filtros"
        />

        <section
          className={cn(
            "absolute inset-x-2 bottom-2 top-[calc(env(safe-area-inset-top)+5rem)] flex min-h-0 flex-col rounded-[var(--radius-xl)] p-4 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
            mobileOpen ? "translate-y-0" : "translate-y-12",
            "bg-[var(--surface-glass)] backdrop-blur-3xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
          )}
        >
          <div className="mb-4 flex items-center justify-end shrink-0">
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "dashboard-focusable inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)]",
                "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] transition-all"
              )}
              aria-label="Cerrar filtros"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <PanelBody
              filters={filters}
              onFiltersChange={onFiltersChange}
              items={items}
              viewportItems={viewportItems}
              loading={loading}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={onSelectBusiness}
              requestingLocation={requestingLocation}
              hasUserLocation={hasUserLocation}
              locationError={locationError}
              onRequestUserLocation={onRequestUserLocation}
              nameQuery={nameQuery}
              onNameQueryChange={setNameQuery}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              filtersExpanded={mobileFiltersExpanded}
              onToggleFilters={() => setMobileFiltersExpanded((current) => !current)}
              filtersRegionId="sucursales-filters-controls-mobile"
              onClearAll={handleClearAll}
            />
          </div>
        </section>
      </div>
    </>
  );
}
