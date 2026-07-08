import type { AgendaFilters } from "@/lib/agenda/types";
import { Search, ShieldCheck, UserRound, WandSparkles } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { BookingStatus, Service, Staff } from "@/types";
import CustomSelect from "@/components/ui/CustomSelect";

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
    <section aria-label="Filtros de agenda" className="rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-md)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            <AppIcon icon={ShieldCheck} size="xs" />
            Estado
          </span>
          <CustomSelect<AgendaFilters["status"]>
            value={filters.status}
            onChange={(val) => onFiltersChange(updateStatus(filters, val))}
            options={STATUS_OPTIONS}
            buttonClassName="!h-[3.25rem] !bg-[var(--surface-3)]"
          />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            <AppIcon icon={UserRound} size="xs" />
            Staff
          </span>
          <CustomSelect<string>
            value={filters.staffId}
            onChange={(val) => onFiltersChange({ ...filters, staffId: val })}
            options={[
              { value: "all", label: "Todo el staff" },
              ...staff.map((member) => ({ value: member.id, label: member.name })),
            ]}
            buttonClassName="!h-[3.25rem] !bg-[var(--surface-3)]"
          />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            <AppIcon icon={WandSparkles} size="xs" />
            Servicio
          </span>
          <CustomSelect<string>
            value={filters.serviceId}
            onChange={(val) => onFiltersChange({ ...filters, serviceId: val })}
            options={[
              { value: "all", label: "Todos los servicios" },
              ...services.map((service) => ({ value: service.id, label: service.name })),
            ]}
            buttonClassName="!h-[3.25rem] !bg-[var(--surface-3)]"
          />
        </div>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
            <AppIcon icon={Search} size="xs" />
            Buscar
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            placeholder="ID, estado, staff, servicio..."
            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 py-2.5 text-[13px] font-semibold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-[var(--surface-3)] focus:outline-none focus:ring-4 focus:ring-[var(--app-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:placeholder:text-[var(--text-muted)] dark:focus:border-[var(--app-primary)] dark:focus:bg-[var(--surface-1)] dark:focus:ring-[var(--app-primary)]"
          />
        </label>
      </div>
    </section>
  );
}
