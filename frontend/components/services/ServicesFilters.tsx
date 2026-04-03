import Input from "@/components/ui/Input";
import type { ServiceStatusFilter, ServicesFiltersState } from "@/lib/services/useServices";

interface ServicesFiltersProps {
  filters: ServicesFiltersState;
  onFiltersChange: (next: ServicesFiltersState) => void;
}

const STATUS_OPTIONS: Array<{ value: ServiceStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

export default function ServicesFilters({
  filters,
  onFiltersChange,
}: ServicesFiltersProps) {
  return (
    <section className="dashboard-surface-1 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          id="services-search"
          label="Buscar por nombre"
          placeholder="Ej. Corte premium"
          value={filters.query}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              query: event.target.value,
            })
          }
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="services-status" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Estado
          </label>
          <select
            id="services-status"
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value as ServiceStatusFilter,
              })
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
