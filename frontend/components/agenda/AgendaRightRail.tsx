import type { AgendaBooking } from "@/lib/agenda/types";

interface AgendaRightRailProps {
  total: number;
  pending: number;
  confirmed: number;
  nextBookings: AgendaBooking[];
}

export default function AgendaRightRail({ total, pending, confirmed, nextBookings }: AgendaRightRailProps) {
  return (
    <aside aria-label="Resumen de agenda" className="dashboard-surface-1 p-4 sm:p-5">
      <h3 className="dashboard-title text-base font-semibold">Resumen del periodo</h3>

      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <div className="dashboard-surface-2 p-3">
          <dt className="dashboard-text-muted text-xs uppercase tracking-wide">Total</dt>
          <dd className="dashboard-title mt-1 text-xl font-semibold">{total}</dd>
        </div>
        <div className="rounded-[var(--dashboard-radius-md)] border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/35 dark:bg-amber-500/15">
          <dt className="text-xs uppercase tracking-wide text-amber-800 dark:text-amber-200">Pendientes</dt>
          <dd className="mt-1 text-xl font-semibold text-amber-900 dark:text-amber-100">{pending}</dd>
        </div>
        <div className="rounded-[var(--dashboard-radius-md)] border border-teal-300 bg-teal-50 p-3 dark:border-teal-500/35 dark:bg-teal-500/15">
          <dt className="text-xs uppercase tracking-wide text-teal-800 dark:text-teal-200">Confirmadas</dt>
          <dd className="mt-1 text-xl font-semibold text-teal-900 dark:text-teal-100">{confirmed}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <h4 className="dashboard-title text-sm font-semibold">Proximos eventos</h4>
        {nextBookings.length === 0 ? (
          <p className="dashboard-text-muted mt-2 rounded-[var(--dashboard-radius-md)] border border-dashed border-[color:var(--dashboard-border-default)] p-3 text-xs">
            No hay eventos proximos en este rango.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {nextBookings.map((booking) => (
              <li key={booking.id} className="dashboard-surface-2 p-3 text-sm">
                <p className="dashboard-title font-medium">{booking.serviceName}</p>
                <p className="dashboard-text-secondary mt-1 text-xs">{booking.staffName}</p>
                <p className="dashboard-text-muted mt-1 text-xs">
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
