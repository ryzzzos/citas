import type { AgendaFilters } from "@/lib/agenda/types";
import { Search, ShieldCheck, UserRound, WandSparkles } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
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
    <section aria-label="Filtros de agenda" className="dashboard-surface-1 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="dashboard-text-secondary space-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={ShieldCheck} size="xs" />
            Estado
          </span>
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange(updateStatus(filters, event.target.value as AgendaFilters["status"]))}
            className="dashboard-surface-2 dashboard-focusable min-h-11 w-full px-3 text-sm [color:var(--dashboard-text-primary)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="dashboard-text-secondary space-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={UserRound} size="xs" />
            Staff
          </span>
          <select
            value={filters.staffId}
            onChange={(event) => onFiltersChange({ ...filters, staffId: event.target.value })}
            className="dashboard-surface-2 dashboard-focusable min-h-11 w-full px-3 text-sm [color:var(--dashboard-text-primary)]"
          >
            <option value="all">Todo el staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="dashboard-text-secondary space-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={WandSparkles} size="xs" />
            Servicio
          </span>
          <select
            value={filters.serviceId}
            onChange={(event) => onFiltersChange({ ...filters, serviceId: event.target.value })}
            className="dashboard-surface-2 dashboard-focusable min-h-11 w-full px-3 text-sm [color:var(--dashboard-text-primary)]"
          >
            <option value="all">Todos los servicios</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="dashboard-text-secondary space-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <AppIcon icon={Search} size="xs" />
            Buscar
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            placeholder="ID, estado, staff o servicio"
            className="dashboard-surface-2 dashboard-focusable min-h-11 w-full px-3 text-sm [color:var(--dashboard-text-primary)] placeholder:[color:var(--dashboard-text-muted)]"
          />
        </label>
      </div>
    </section>
  );
}
