import type { AgendaBooking } from "@/lib/agenda/types";

interface BookingCardProps {
  booking: AgendaBooking;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "border-amber-400/40 bg-amber-300/10 text-amber-200",
  confirmed: "border-emerald-400/50 bg-emerald-300/10 text-emerald-200",
  cancelled: "border-rose-400/50 bg-rose-300/10 text-rose-200",
  completed: "border-sky-400/50 bg-sky-300/10 text-sky-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function BookingCard({ booking, onConfirm, onCancel, onReschedule }: BookingCardProps) {
  const statusClass = STATUS_BADGE[booking.status] ?? "border-zinc-600 bg-zinc-800 text-zinc-200";
  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;

  return (
    <article className="rounded-2xl border border-zinc-700/70 bg-zinc-900/85 p-3 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.95)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{booking.serviceName}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-xs text-zinc-300">
        <div>
          <dt className="text-zinc-500">Staff</dt>
          <dd className="font-medium text-zinc-200">{booking.staffName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Reserva</dt>
          <dd className="font-mono text-[11px] text-zinc-400">{booking.id.slice(0, 8)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-11 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          aria-label={`Confirmar cita ${booking.id}`}
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-11 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          aria-label={`Cancelar cita ${booking.id}`}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-11 rounded-xl border border-zinc-600 bg-zinc-800/80 px-3 text-xs font-semibold text-zinc-100 transition hover:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label={`Reprogramar cita ${booking.id}`}
        >
          Reprogramar
        </button>
      </div>
    </article>
  );
}
