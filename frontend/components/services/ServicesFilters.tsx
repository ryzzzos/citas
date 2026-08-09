import { Search, ShieldCheck, LayoutGrid, List, Tags } from "lucide-react";
import { motion } from "framer-motion";
import AppIcon from "@/components/ui/AppIcon";
import type { ServiceCategory } from "@/types";
import type { ServiceStatusFilter, ServicesFiltersState } from "@/lib/services/useServices";
import CustomSelect from "@/components/ui/CustomSelect";

interface ServicesFiltersProps {
  filters: ServicesFiltersState;
  onFiltersChange: (next: ServicesFiltersState) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  categories: ServiceCategory[];
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
  categories,
}: ServicesFiltersProps) {

  return (
    <section className="flex flex-col xl:flex-row items-center gap-3 w-full">
      <div className="relative flex-1 w-full xl:w-auto">
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

      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full xl:w-auto">
        <CustomSelect<ServiceStatusFilter>
          id="services-status"
          value={filters.status}
          onChange={(val) =>
            onFiltersChange({
              ...filters,
              status: val,
            })
          }
          options={STATUS_OPTIONS}
          icon={ShieldCheck}
          variant="glass"
          className="flex-1 min-w-0 sm:flex-none sm:min-w-[170px] sm:w-auto"
        />

        <CustomSelect<string>
          id="services-category"
          value={filters.categoryId}
          onChange={(val) =>
            onFiltersChange({
              ...filters,
              categoryId: val,
            })
          }
          options={[
            { value: "all", label: "Todas las categorías" },
            { value: "null", label: "Sin categoría" },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
          icon={Tags}
          variant="glass"
          className="flex-1 min-w-0 sm:flex-none sm:min-w-[170px] sm:w-auto"
        />

        <div className="inline-flex h-9 sm:h-10 items-center gap-0.5 sm:gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--surface-glass)] backdrop-blur-md p-1 shadow-[var(--glass-shadow)] shrink-0 justify-center">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className="group relative inline-flex h-full items-center justify-center rounded-full px-2.5 sm:px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] cursor-pointer"
            aria-label="Vista cuadrícula"
            title="Vista cuadrícula"
          >
            {viewMode === "grid" && (
              <motion.div
                layoutId="view-mode-pill"
                className="absolute inset-0 rounded-full bg-[var(--surface-1)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)]"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <AppIcon icon={LayoutGrid} size="sm" className={`relative z-10 transition-colors ${viewMode === "grid" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}`} />
          </button>
          
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className="group relative inline-flex h-full items-center justify-center rounded-full px-2.5 sm:px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] cursor-pointer"
            aria-label="Vista lista"
            title="Vista lista"
          >
            {viewMode === "list" && (
              <motion.div
                layoutId="view-mode-pill"
                className="absolute inset-0 rounded-full bg-[var(--surface-1)] shadow-[var(--shadow-sm)] border border-[var(--border-strong)]"
                initial={false}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <AppIcon icon={List} size="sm" className={`relative z-10 transition-colors ${viewMode === "list" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
