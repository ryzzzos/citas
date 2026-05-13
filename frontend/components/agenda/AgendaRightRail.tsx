import type { AgendaBooking } from "@/lib/agenda/types";

interface AgendaRightRailProps {
  total: number;
  pending: number;
  confirmed: number;
  nextBookings: AgendaBooking[];
}

export default function AgendaRightRail({ total, pending, confirmed, nextBookings }: AgendaRightRailProps) {
  return (
    <aside aria-label="Resumen de agenda" className="rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-md)] backdrop-blur-2xl dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]">
      <h3 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)]">Resumen del periodo</h3>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Total</dt>
          <dd className="mt-1 text-[26px] font-bold tracking-tight text-[var(--text-primary)]">{total}</dd>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-500/10 p-4 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">Pendientes</dt>
          <dd className="mt-1 text-[26px] font-bold tracking-tight text-amber-900 dark:text-amber-100">{pending}</dd>
        </div>
        <div className="rounded-2xl border border-blue-200/60 bg-blue-500/10 p-4 shadow-[inset_0_1px_rgba(255,255,255,0.4)] backdrop-blur-sm dark:border-blue-500/30 dark:bg-blue-500/10">
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Confirmadas</dt>
          <dd className="mt-1 text-[26px] font-bold tracking-tight text-blue-900 dark:text-blue-100">{confirmed}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h4 className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">Próximos eventos</h4>
        {nextBookings.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-4 text-[13px] font-medium text-[var(--text-muted)] dark:border-zinc-700 ">
            No hay eventos próximos en este rango.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {nextBookings.map((booking) => (
              <li key={booking.id} className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-[var(--shadow-sm)])] backdrop-blur-sm transition-transform hover:scale-[1.02] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
                <p className="text-[14px] font-bold tracking-tight text-[var(--text-primary)]">{booking.serviceName}</p>
                <p className="mt-1 text-[13px] font-medium text-[var(--text-secondary)]">{booking.staffName}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-[var(--app-primary)] dark:text-blue-400">
                  {booking.startAt.toFormat("dd LLL HH:mm")} - {booking.endAt.toFormat("HH:mm")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
