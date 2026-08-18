"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, MapPin, Search, SlidersHorizontal, X } from "lucide-react";

import CustomSelect from "@/components/ui/CustomSelect";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface DynamicSearchItem {
  id: string;
  name: string;
  category?: string;
  city?: string;
  address?: string;
  logo_image_url?: string | null;
}

export interface DynamicSearchFilters {
  city: string;
  category: string;
}

export interface DynamicSearchProps {
  items?: DynamicSearchItem[];
  loading?: boolean;
  filters?: DynamicSearchFilters;
  categories?: string[];
  placeholder?: string;
  onFiltersChange?: (filters: DynamicSearchFilters) => void;
  onSelectResult?: (id: string) => void;
  variant?: "small" | "large";
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
  maxResults?: number;
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

function ResultAvatar({ logoUrl, name }: { logoUrl?: string | null; name: string }) {
  const [error, setError] = useState(false);
  const showImage = Boolean(logoUrl && !error);

  return (
    <div className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-strong)]">
      {showImage ? (
        <Image
          src={logoUrl as string}
          alt={name}
          fill
          sizes="28px"
          className="object-cover"
          unoptimized
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-[0.55rem] font-bold uppercase text-[var(--text-secondary)]">
          {toInitials(name)}
        </span>
      )}
    </div>
  );
}

export default function DynamicSearch({
  items = [],
  loading = false,
  filters = { city: "", category: "" },
  categories: externalCategories,
  placeholder = "Buscar sucursal...",
  onFiltersChange,
  onSelectResult,
  variant = "small",
  isExpanded: controlledExpanded,
  onExpandedChange,
  className,
  maxResults = 6,
}: DynamicSearchProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : uncontrolledExpanded;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (controlledExpanded === undefined) {
        setUncontrolledExpanded(next);
      }
      onExpandedChange?.(next);
    },
    [controlledExpanded, onExpandedChange]
  );

  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories =
    externalCategories ?? [
      "",
      ...Array.from(new Set(items.map((item) => item.category || ""))).filter(Boolean).sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    ];

  const results =
    query.trim().length === 0
      ? []
      : items
          .filter((biz) =>
            `${biz.name} ${biz.category || ""} ${biz.city || ""} ${biz.address || ""}`
              .toLocaleLowerCase("es")
              .includes(query.trim().toLocaleLowerCase("es"))
          )
          .slice(0, maxResults);

  const hasActiveFilters = Boolean(
    (filters.city && filters.city.trim().length > 0) ||
    (filters.category && filters.category.trim().length > 0)
  );

  const openSearch = useCallback(() => {
    setExpanded(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [setExpanded]);

  const closeSearch = useCallback(() => {
    setExpanded(false);
    setQuery("");
    setFiltersVisible(false);
  }, [setExpanded]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelectResult?.(id);
      closeSearch();
    },
    [onSelectResult, closeSearch]
  );

  const handleFilterChange = useCallback(
    (patch: Partial<DynamicSearchFilters>) => {
      onFiltersChange?.({ ...filters, ...patch });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange?.({ city: "", category: "" });
    setQuery("");
  }, [onFiltersChange]);

  // Click outside & Escape key listeners
  useEffect(() => {
    if (!isExpanded) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSearch();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, closeSearch]);

  /* ── Dropdown Combobox Panel ───────────────────────────────── */
  const renderDropdown = (dropdownClassName?: string) => (
    <motion.div
      key="dynamic-search-dropdown-menu"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
      className={cn(
        "absolute top-[calc(100%+0.5rem)] z-[800] p-3 flex flex-col gap-3 rounded-[var(--radius-lg)]",
        "bg-[var(--surface-3)] shadow-[var(--shadow-lg)] border border-[var(--border-strong)] backdrop-blur-3xl",
        dropdownClassName
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Filters Pill Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFiltersVisible((v) => !v);
          }}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold transition-all duration-200",
            filtersVisible
              ? "bg-[var(--app-primary)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
          )}
        >
          <SlidersHorizontal className="h-2.5 w-2.5" />
          Filtros
        </button>

        {filters.city && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold bg-[color-mix(in_oklab,var(--color-info)_10%,transparent)] text-[var(--color-info)] border border-[var(--color-info)]/15">
            <MapPin className="h-2.5 w-2.5" />
            {filters.city}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFilterChange({ city: "" });
              }}
              className="ml-0.5 hover:opacity-70"
            >
              <X className="h-2 w-2" />
            </button>
          </span>
        )}

        {filters.category && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[0.65rem] font-semibold bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] text-[var(--color-success)] border border-[var(--color-success)]/15">
            {filters.category}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFilterChange({ category: "" });
              }}
              className="ml-0.5 hover:opacity-70"
            >
              <X className="h-2 w-2" />
            </button>
          </span>
        )}
      </div>

      {/* Collapsible Inputs */}
      {filtersVisible && (
        <div className="grid grid-cols-2 gap-2.5 pb-2 border-b border-[var(--border-strong)]/20 shrink-0 animate-in slide-in-from-top-1 duration-200">
          <label className="space-y-0.5">
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Ciudad
            </span>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange({ city: e.target.value })}
              placeholder="Ej: Medellín"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1 text-[0.75rem] text-[var(--text-primary)] outline-none focus:border-[var(--app-primary)] placeholder:text-[var(--text-muted)]"
              onClick={(e) => e.stopPropagation()}
            />
          </label>
          <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Categoría
            </span>
            <CustomSelect<string>
              value={filters.category}
              onChange={(val) => handleFilterChange({ category: val })}
              options={categories.map((cat) => ({
                value: cat,
                label: cat || "Todas",
              }))}
              buttonClassName="!h-[26px] !py-0.5 !px-2 !rounded-[var(--radius-sm)] !text-[0.75rem] !bg-[var(--surface-2)] font-semibold"
              menuClassName="!rounded-[var(--radius-sm)]"
            />
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="flex-1 overflow-y-auto max-h-[220px] pr-0.5 space-y-1">
        {loading && results.length === 0 && query.trim().length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
          </div>
        )}

        {query.trim().length === 0 && (
          <div className="text-center py-6 text-[0.78rem] text-[var(--text-muted)]">
            <Search className="h-4 w-4 mx-auto opacity-30 mb-1" />
            <p>Escribe para buscar sucursales...</p>
          </div>
        )}

        {query.trim().length > 0 && results.length === 0 && !loading && (
          <div className="text-center py-6">
            <Search className="h-4 w-4 mx-auto text-[var(--text-muted)] opacity-40 mb-1" />
            <p className="text-[0.75rem] font-semibold text-[var(--text-primary)]">Sin resultados</p>
          </div>
        )}

        {results.map((biz) => (
          <button
            key={biz.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(biz.id);
            }}
            className="w-full flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-left hover:bg-[var(--surface-2)] transition-colors group"
          >
            <ResultAvatar logoUrl={biz.logo_image_url} name={biz.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.78rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--app-primary)] transition-colors">
                {biz.name}
              </p>
              <p className="truncate text-[0.65rem] text-[var(--text-muted)]">
                {biz.category} · {biz.city}
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-60 transition-all" />
          </button>
        ))}
      </div>
    </motion.div>
  );

  /* ── 1. Large Variant (Elongated static search capsule) ────── */
  if (variant === "large") {
    return (
      <div ref={containerRef} className={cn("flex-1 max-w-md relative", className)}>
        {/* Input Capsule Box */}
        <div
          className={cn(
            "flex h-10 items-center gap-2 rounded-full px-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text-primary)] w-full transition-all duration-300",
            isExpanded && "bg-[var(--surface-3)] border-[var(--app-primary)]/35 shadow-[var(--shadow-sm)]"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={openSearch}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[0.82rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
          {(query.trim() || hasActiveFilters) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeSearch();
              }}
              className="shrink-0 text-[0.72rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Dropdown Combobox panel hanging directly under capsule */}
        <AnimatePresence>
          {isExpanded && renderDropdown("left-0 w-full")}
        </AnimatePresence>
      </div>
    );
  }

  /* ── 2. Small Variant (Morphing button that stretches) ─────── */
  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center select-none shrink-0", className)}
    >
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 340 : 40,
        }}
        transition={{ type: "spring", stiffness: 420, damping: 35, mass: 0.6 }}
        className={cn(
          "relative flex h-10 items-center rounded-full border overflow-hidden shrink-0 transition-colors duration-200",
          isExpanded
            ? "bg-[var(--surface-3)] border-[var(--app-primary)]/40 shadow-[var(--shadow-md)] pr-2"
            : "bg-[var(--surface-2)] border-[var(--border-strong)] hover:bg-[var(--surface-3)] cursor-pointer active:scale-95",
        )}
        onClick={() => {
          if (!isExpanded) {
            openSearch();
          }
        }}
      >
        {/* Search Icon pinned in a fixed 40px square/center */}
        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
          <Search
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-200",
              isExpanded ? "text-[var(--app-primary)]" : "text-[var(--text-secondary)]",
            )}
          />
        </div>

        {/* Expandable input container with fluid horizontal animation */}
        <motion.div
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
          className="flex-1 flex items-center gap-1.5 min-w-0 pr-1"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-[0.82rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none min-w-0"
            autoFocus={isExpanded}
            onClick={(e) => e.stopPropagation()}
          />
          {(query.trim() || hasActiveFilters) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeSearch();
            }}
            className="shrink-0 text-[0.72rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-1 transition-colors"
          >
            Cerrar
          </button>
        </motion.div>
      </motion.div>

      {/* Morphing Dropdown Panel */}
      <AnimatePresence>
        {isExpanded &&
          renderDropdown("right-0 w-[calc(100vw-2rem)] max-w-[360px] sm:w-[360px]")}
      </AnimatePresence>
    </div>
  );
}
