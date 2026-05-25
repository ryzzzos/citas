import type { AgendaBooking } from "@/lib/agenda/types";

interface AgendaRightRailProps {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  completed: number;
  cancelled: number;
}

import { ClipboardList, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";

export default function AgendaRightRail({ total, pending, confirmed, completed, cancelled }: AgendaRightRailProps) {
  return (
    <aside aria-label="Resumen de agenda" className="flex h-full flex-col rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-md)]">
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Resumen del periodo</h3>

      <dl className="mt-4 flex flex-1 flex-col gap-3">
        {/* Total Reservas */}
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--text-primary)_6%,var(--surface-3)),var(--surface-3))] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text-primary)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={ClipboardList} className="h-4 w-4" />
            </div>
            <dt className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Reservas</dt>
          </div>
          <dd className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{total}</dd>
        </div>

        {/* Pendientes */}
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-pending)_8%,var(--surface-3)),var(--surface-3))] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-pending)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={Hourglass} className="h-4 w-4" />
            </div>
            <dt className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Pendientes</dt>
          </div>
          <dd className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{pending}</dd>
        </div>

        {/* Confirmadas */}
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-info)_8%,var(--surface-3)),var(--surface-3))] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-info)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={CheckCircle2} className="h-4 w-4" />
            </div>
            <dt className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Confirmadas</dt>
          </div>
          <dd className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{confirmed}</dd>
        </div>

        {/* Completadas */}
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-success)_8%,var(--surface-3)),var(--surface-3))] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-success)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={CheckCircle2} className="h-4 w-4" />
            </div>
            <dt className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Completadas</dt>
          </div>
          <dd className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{completed}</dd>
        </div>

        {/* Canceladas */}
        <div className="flex flex-1 items-center justify-between rounded-2xl border border-[var(--border-strong)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-error)_8%,var(--surface-3)),var(--surface-3))] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error)] text-[var(--surface-3)] shadow-[var(--shadow-sm)]">
              <AppIcon icon={XCircle} className="h-4 w-4" />
            </div>
            <dt className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">Canceladas</dt>
          </div>
          <dd className="text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{cancelled}</dd>
        </div>
      </dl>
    </aside>
  );
}
