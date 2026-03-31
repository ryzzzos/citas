import type { AgendaBooking } from "@/lib/agenda/types";

interface AgendaRightRailProps {
  total: number;
  pending: number;
  confirmed: number;
  nextBookings: AgendaBooking[];
}

export default function AgendaRightRail({ total, pending, confirmed, nextBookings }: AgendaRightRailProps) {
  return (
    <aside aria-label="Resumen de agenda" className="rounded-3xl border border-zinc-800 bg-zinc-900/75 p-4 sm:p-5">
      <h3 className="text-base font-semibold text-zinc-100">Resumen del periodo</h3>

      <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-2xl border border-zinc-700 bg-zinc-950/70 p-3">
          <dt className="text-xs uppercase tracking-wide text-zinc-500">Total</dt>
          <dd className="mt-1 text-xl font-semibold text-zinc-100">{total}</dd>
        </div>
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3">
          <dt className="text-xs uppercase tracking-wide text-amber-200">Pendientes</dt>
          <dd className="mt-1 text-xl font-semibold text-amber-100">{pending}</dd>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-3">
          <dt className="text-xs uppercase tracking-wide text-emerald-200">Confirmadas</dt>
          <dd className="mt-1 text-xl font-semibold text-emerald-100">{confirmed}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-zinc-200">Proximos eventos</h4>
        {nextBookings.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-zinc-700 p-3 text-xs text-zinc-500">
            No hay eventos proximos en este rango.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {nextBookings.map((booking) => (
              <li key={booking.id} className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-3 text-sm">
                <p className="font-medium text-zinc-100">{booking.serviceName}</p>
                <p className="mt-1 text-xs text-zinc-400">{booking.staffName}</p>
                <p className="mt-1 text-xs text-zinc-500">
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
