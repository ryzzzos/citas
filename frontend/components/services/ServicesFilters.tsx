import { Search, ShieldCheck, LayoutGrid, List } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { ServiceStatusFilter, ServicesFiltersState } from "@/lib/services/useServices";

interface ServicesFiltersProps {
  filters: ServicesFiltersState;
  onFiltersChange: (next: ServicesFiltersState) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const STATUS_OPTIONS: Array<{ value: ServiceStatusFilter; label: string }> = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Solo activos" },
  { value: "inactive", label: "Solo inactivos" },
];

export default function ServicesFilters({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: ServicesFiltersProps) {
  return (
    <section className="flex flex-col sm:flex-row items-center gap-3 w-full">
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <AppIcon icon={Search} className="text-[var(--text-muted)]" size="sm" />
        </div>
        <input
          id="services-search"
          type="search"
          placeholder="Buscar servicios..."
          value={filters.query}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              query: event.target.value,
            })
          }
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all shadow-[var(--shadow-sm)]"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none min-w-[170px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <AppIcon icon={ShieldCheck} className="text-[var(--text-muted)]" size="sm" />
          </div>
          <select
            id="services-status"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as ServiceStatusFilter,
              })
            }
            className="w-full h-11 pl-10 pr-8 rounded-xl bg-[var(--surface-3)] border border-[var(--border-strong)] text-[14px] text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--app-primary)] focus:ring-1 focus:ring-[var(--app-primary)] transition-all shadow-[var(--shadow-sm)] cursor-pointer"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
             <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
             </svg>
          </div>
        </div>

        <div className="inline-flex h-11 items-center gap-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-1 shadow-[var(--shadow-sm)] shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 text-[13px] font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-label="Vista cuadrícula"
            title="Vista cuadrícula"
          >
            <AppIcon icon={LayoutGrid} size="sm" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`inline-flex h-full items-center justify-center rounded-lg px-3 text-[13px] font-semibold transition-all ${
              viewMode === "list"
                ? "bg-[var(--surface-1)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            aria-label="Vista lista"
            title="Vista lista"
          >
            <AppIcon icon={List} size="sm" />
          </button>
        </div>
      </div>
    </section>
  );
}
