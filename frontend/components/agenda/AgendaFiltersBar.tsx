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
    <section aria-label="Filtros de agenda" className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <AppIcon icon={ShieldCheck} size="xs" />
            Estado
          </span>
          <select
            value={filters.status}
            onChange={(event) => onFiltersChange(updateStatus(filters, event.target.value as AgendaFilters["status"]))}
            className="w-full appearance-none rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-white dark:focus:border-[var(--app-primary-strong)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <AppIcon icon={UserRound} size="xs" />
            Staff
          </span>
          <select
            value={filters.staffId}
            onChange={(event) => onFiltersChange({ ...filters, staffId: event.target.value })}
            className="w-full appearance-none rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-white dark:focus:border-[var(--app-primary-strong)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)]"
          >
            <option value="all">Todo el staff</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <AppIcon icon={WandSparkles} size="xs" />
            Servicio
          </span>
          <select
            value={filters.serviceId}
            onChange={(event) => onFiltersChange({ ...filters, serviceId: event.target.value })}
            className="w-full appearance-none rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-4 py-2.5 text-[13px] font-semibold text-slate-900 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-white dark:focus:border-[var(--app-primary-strong)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)]"
          >
            <option value="all">Todos los servicios</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <AppIcon icon={Search} size="xs" />
            Buscar
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            placeholder="ID, estado, staff, servicio..."
            className="w-full rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-4 py-2.5 text-[13px] font-semibold text-slate-900 placeholder:text-zinc-400 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all focus:border-[var(--app-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--app-primary-soft)] dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-[var(--app-primary-strong)] dark:focus:bg-zinc-900 dark:focus:ring-[rgba(37,99,235,0.15)]"
          />
        </label>
      </div>
    </section>
  );
}
