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
        "glass-floating-muted",
        "relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border p-0"
      )}
      style={{
        borderColor: "var(--glass-border-default)",
        backgroundColor: "var(--glass-bg-soft)",
      }}
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
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-200">
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
  total,
  loading,
  error,
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
}: {
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
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
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

  const activeContext = useMemo(() => {
    const chips: string[] = [];

    if (filters.city.trim()) {
      chips.push(`Ciudad: ${filters.city.trim()}`);
    }

    if (filters.category.trim()) {
      chips.push(`Categoria: ${filters.category.trim()}`);
    }

    if (nameQuery.trim()) {
      chips.push(`Nombre: ${nameQuery.trim()}`);
    }

    if (sortMode !== "viewport") {
      const labelsBySort: Record<Exclude<SortMode, "viewport">, string> = {
        "name-asc": "Nombre A-Z",
        "name-desc": "Nombre Z-A",
        category: "Categoria",
      };

      chips.push(`Orden: ${labelsBySort[sortMode]}`);
    }

    return chips;
  }, [filters.category, filters.city, nameQuery, sortMode]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = nameQuery.trim().toLocaleLowerCase("es");

    let nextItems =
      normalizedQuery.length === 0
        ? items
        : items.filter((business) => {
            const searchable = `${business.name} ${business.category} ${business.city}`.toLocaleLowerCase("es");
            return searchable.includes(normalizedQuery);
          });

    if (sortMode === "viewport") {
      return nextItems;
    }

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

  const filteredViewportCount = useMemo(() => {
    const normalizedQuery = nameQuery.trim().toLocaleLowerCase("es");
    if (normalizedQuery.length === 0) {
      return viewportItems.length;
    }

    return viewportItems.filter((business) => {
      const searchable = `${business.name} ${business.category} ${business.city}`.toLocaleLowerCase("es");
      return searchable.includes(normalizedQuery);
    }).length;
  }, [nameQuery, viewportItems]);

  const inputBaseClassName =
    "dashboard-focusable mt-1 w-full rounded-xl border border-zinc-300/70 bg-white/80 px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 dark:border-zinc-700/80 dark:bg-zinc-900/75 dark:text-zinc-100 dark:placeholder:text-zinc-500";

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="glass-panel-accent p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-semibold text-white/82">
              Descubrimiento en mapa
            </p>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-white">
              Sucursales cercanas
            </h2>
          </div>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/34 bg-white/16 px-3 text-[0.7rem] font-semibold text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            En vivo
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-white/84">
          Ajusta filtros, mueve el mapa y compara negocios activos dentro del area visible.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <article className="rounded-xl border border-white/30 bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-white/74">
              En vista
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white">
              {loading ? "..." : filteredViewportCount}
            </p>
          </article>

          <article className="rounded-xl border border-white/30 bg-white/15 p-3 backdrop-blur-sm">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-white/74">
              Total hallado
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-white">{total}</p>
          </article>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRequestUserLocation}
            disabled={requestingLocation}
            className="dashboard-focusable inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/34 bg-black/18 px-4 text-[0.72rem] font-semibold text-white transition hover:bg-black/28 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {requestingLocation ? "Ubicando..." : hasUserLocation ? "Actualizar mi ubicacion" : "Usar mi ubicacion"}
          </button>

          {locationError ? (
            <div className="rounded-xl border border-amber-300/65 bg-black/22 px-3 py-2 text-[0.69rem] text-white/96">
              {locationError}
            </div>
          ) : null}
        </div>

        <div className="mt-3 rounded-xl border border-white/28 bg-white/14 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs font-medium text-white/86">
            {loading
              ? "Actualizando resultados dentro del area visible..."
              : `${filteredItems.length} resultados visibles en el area activa`}
          </p>
        </div>
      </header>

      <section className={cn("glass-panel", "rounded-2xl p-3.5")}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onToggleFilters}
            aria-expanded={filtersExpanded}
            aria-controls={filtersRegionId}
            className="dashboard-focusable inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100"
          >
            Filtros y controles
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${filtersExpanded ? "rotate-180" : "rotate-0"}`}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              "dashboard-focusable inline-flex min-h-9 items-center rounded-full px-3 text-[0.72rem] font-semibold text-zinc-700 dark:text-zinc-100",
              "glass-floating"
            )}
          >
            Limpiar todo
          </button>
        </div>

        {activeContext.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {activeContext.map((chip) => (
              <span
                key={chip}
                className={cn(
                  "glass-floating",
                  "inline-flex min-h-7 items-center px-2.5 text-[0.65rem] font-medium text-zinc-700 dark:text-zinc-100"
                )}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-[0.72rem] font-medium text-zinc-500 dark:text-zinc-400">Sin filtros activos.</p>
        )}

        {filtersExpanded ? (
          <div id={filtersRegionId}>
            <label className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500 dark:text-zinc-400">
              Buscar negocio
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={nameQuery}
                  onChange={(event) => onNameQueryChange(event.target.value)}
                  placeholder="Nombre, categoria o ciudad"
                  className={`${inputBaseClassName} pl-9`}
                />
              </div>
            </label>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500 dark:text-zinc-400">
                Ciudad
                <input
                  type="text"
                  value={filters.city}
                  onChange={(event) => onFiltersChange({ ...filters, city: event.target.value })}
                  placeholder="Ej: Santiago"
                  className={inputBaseClassName}
                />
              </label>

              <label className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500 dark:text-zinc-400">
                Categoria
                <select
                  value={filters.category}
                  onChange={(event) => onFiltersChange({ ...filters, category: event.target.value })}
                  className={inputBaseClassName}
                >
                  {categories.map((category) => (
                    <option key={category || "all"} value={category}>
                      {category || "Todas"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-2 block text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500 dark:text-zinc-400">
              Orden de lista
              <select
                value={sortMode}
                onChange={(event) => onSortModeChange(event.target.value as SortMode)}
                className={inputBaseClassName}
              >
                <option value="viewport">Cerca de mi</option>
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="category">Categoria</option>
              </select>
            </label>

            {categorySummary.length > 0 ? (
              <div className="mt-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Categorias visibles
                </p>
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {categorySummary.map(([category, count]) => {
                    const active = filters.category === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => onFiltersChange({ ...filters, category: active ? "" : category })}
                        className={cn(
                          "dashboard-focusable inline-flex min-h-8 shrink-0 items-center gap-1 px-3 text-[0.67rem] font-medium transition",
                          "glass-floating",
                          active
                            ? "border-[color:var(--dashboard-accent)] text-[color:var(--dashboard-text-primary)]"
                            : "text-zinc-700 dark:text-zinc-200"
                        )}
                      >
                        {category}
                        <span className="text-zinc-500 dark:text-zinc-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p id={filtersRegionId} className="text-xs text-zinc-500 dark:text-zinc-400">
            Filtros contraidos. Expande para refinar resultados.
          </p>
        )}

        {error ? (
          <div className="mt-3 rounded-xl border border-rose-300/70 bg-rose-50/90 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/45 dark:bg-rose-500/18 dark:text-rose-100">
            {error}
          </div>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Negocios cercanos</p>
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            {loading ? "Actualizando" : `${filteredItems.length} listados`}
          </p>
        </div>

        <ul className="h-full min-h-0 space-y-2 overflow-y-auto pr-1">
          {filteredItems.map((business) => {
            const active = selectedBusinessId === business.id;
            return (
              <li key={business.id}>
                <button
                  type="button"
                  onClick={() => onSelectBusiness(business.id)}
                  className={cn(
                    "dashboard-focusable dashboard-interactive w-full rounded-[1.15rem] px-2.5 py-2.5 text-left",
                    "glass-panel",
                    active
                      ? "border-[color:var(--dashboard-accent)] ring-1 ring-[color:color-mix(in_oklab,var(--dashboard-accent)_38%,transparent)]"
                      : "hover:border-zinc-300/80 dark:hover:border-zinc-600/80"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <BusinessProfileAvatar logoUrl={business.logo_image_url} name={business.name} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[0.86rem] font-semibold leading-5 text-zinc-900 dark:text-zinc-100">
                          {business.name}
                        </p>
                        {active ? (
                          <span className="inline-flex min-h-6 items-center rounded-full border border-[color:color-mix(in_oklab,var(--dashboard-accent)_68%,#ffffff_32%)] bg-[color:color-mix(in_oklab,var(--dashboard-accent)_18%,transparent)] px-2 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-zinc-800 dark:text-zinc-100">
                            Activo
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
                        {business.category}
                      </p>

                      {business.public_bio?.trim() ? (
                        <p className="mt-1 line-clamp-1 text-[0.69rem] leading-5 text-zinc-600 dark:text-zinc-300">
                          {business.public_bio}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}

          {!loading && filteredItems.length === 0 ? (
            <li className={cn("glass-panel", "rounded-2xl border-dashed px-3 py-6 text-center text-sm text-zinc-600 dark:text-zinc-300")}>
              {nameQuery.trim()
                ? "No hay resultados con esta busqueda dentro del area visible."
                : "No hay sucursales en el area visible."}
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
      <aside
        className={cn(
          "pointer-events-auto absolute left-4 z-[460] hidden w-[min(390px,calc(100%-2rem))] min-h-0 rounded-[1.85rem] p-4 lg:block",
          "top-[calc(env(safe-area-inset-top)+4.55rem)] h-[calc(100%-env(safe-area-inset-top)-5.55rem)]",
          "glass-panel-heavy"
        )}
      >
        <PanelBody
          filters={filters}
          onFiltersChange={onFiltersChange}
          items={items}
          viewportItems={viewportItems}
          total={total}
          loading={loading}
          error={error}
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

      <button
        type="button"
        onClick={() => onMobileOpenChange(true)}
        className={cn(
          "dashboard-focusable pointer-events-auto fixed bottom-4 left-4 z-[800] inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-100 lg:hidden",
          "glass-floating"
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeFiltersCount > 0 ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-zinc-900 px-1 text-[0.63rem] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {activeFiltersCount}
          </span>
        ) : null}
      </button>

      <div
        className={`fixed inset-0 z-[900] transition ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          onClick={() => onMobileOpenChange(false)}
          className={cn("glass-overlay", "absolute inset-0 transition", mobileOpen ? "opacity-100" : "opacity-0")}
          aria-label="Cerrar filtros"
        />

        <section
          className={cn(
            "absolute inset-x-4 bottom-4 top-[calc(env(safe-area-inset-top)+5.25rem)] flex min-h-0 flex-col rounded-[1.5rem] p-4 transition duration-200",
            mobileOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            "glass-panel-heavy"
          )}
        >
          <div className="mb-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "dashboard-focusable inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 dark:text-zinc-200",
                "glass-floating"
              )}
              aria-label="Cerrar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
            <PanelBody
              filters={filters}
              onFiltersChange={onFiltersChange}
              items={items}
              viewportItems={viewportItems}
              total={total}
              loading={loading}
              error={error}
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
