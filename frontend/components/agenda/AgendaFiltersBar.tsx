import type { AgendaFilters } from "@/lib/agenda/types";
import type { BookingStatus, Service, Staff } from "@/types";

interface AgendaFiltersBarProps {
  filters: AgendaFilters;
  staff: Staff[];
  services: Service[];
  onFiltersChange: (next: AgendaFilters) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: AgendaFilters["status"] }> = [
  { label: "Todos", value: "all" },
  { label: "Pendientes", value: "pending" },
  { label: "Confirmadas", value: "confirmed" },
  { label: "Canceladas", value: "cancelled" },
  { label: "Completadas", value: "completed" },
];

function updateStatus(filters: AgendaFilters, status: BookingStatus | "all"): AgendaFilters {
  return { ...filters, status };
}

export default function AgendaFiltersBar({ filters, staff, services, onFiltersChange }: AgendaFiltersBarProps) {
  return (
    <section aria-label="Filtros de agenda" className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5 text-xs text-zinc-400">
          Estado
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange(updateStatus(filters, event.target.value as AgendaFilters["status"]))}
            className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs text-zinc-400">
          Staff
          <select
            value={filters.staffId}
            onChange={(event) => onFiltersChange({ ...filters, staffId: event.target.value })}
            className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <option value="all">Todo el staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs text-zinc-400">
          Servicio
          <select
            value={filters.serviceId}
            onChange={(event) => onFiltersChange({ ...filters, serviceId: event.target.value })}
            className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <option value="all">Todos los servicios</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs text-zinc-400">
          Buscar
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            placeholder="ID, estado, staff o servicio"
            className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          />
        </label>
      </div>
    </section>
  );
}
