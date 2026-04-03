import type { AgendaBooking } from "@/lib/agenda/types";

interface BookingCardProps {
  booking: AgendaBooking;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-200",
  confirmed: "border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-500/35 dark:bg-teal-500/15 dark:text-teal-200",
  cancelled: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-200",
  completed: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/35 dark:bg-sky-500/15 dark:text-sky-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function BookingCard({ booking, onConfirm, onCancel, onReschedule }: BookingCardProps) {
  const statusClass = STATUS_BADGE[booking.status] ?? "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;

  return (
    <article className="dashboard-surface-2 p-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dashboard-title text-sm font-semibold">{booking.serviceName}</p>
          <p className="dashboard-text-secondary mt-1 text-xs">
            {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      <dl className="dashboard-text-secondary mt-3 grid grid-cols-1 gap-2 text-xs">
        <div>
          <dt className="dashboard-text-muted">Staff</dt>
          <dd className="dashboard-title font-medium">{booking.staffName}</dd>
        </div>
        <div>
          <dt className="dashboard-text-muted">Reserva</dt>
          <dd className="dashboard-text-secondary font-mono text-[11px]">{booking.id.slice(0, 8)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="dashboard-interactive dashboard-focusable min-h-11 rounded-[var(--dashboard-radius-md)] border border-teal-300 bg-teal-50 px-3 text-xs font-semibold text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-teal-500/35 dark:bg-teal-500/15 dark:text-teal-100 dark:hover:bg-teal-500/25"
          aria-label={`Confirmar cita ${booking.id}`}
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="dashboard-interactive dashboard-focusable min-h-11 rounded-[var(--dashboard-radius-md)] border border-rose-300 bg-rose-50 px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-100 dark:hover:bg-rose-500/25"
          aria-label={`Cancelar cita ${booking.id}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="dashboard-surface-2 dashboard-interactive dashboard-focusable min-h-11 px-3 text-xs font-semibold [color:var(--dashboard-text-secondary)]"
          aria-label={`Reprogramar cita ${booking.id}`}
        >
          Reprogramar
        </button>
      </div>
    </article>
  );
}
