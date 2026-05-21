import type { AgendaBooking } from "@/lib/agenda/types";

interface BookingCardProps {
  booking: AgendaBooking;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "border-[var(--color-pending)] bg-[var(--surface-3)] text-[var(--color-pending)] shadow-[var(--shadow-sm)]",
  confirmed: "border-[var(--color-info)] bg-[var(--surface-3)] text-[var(--color-info)] shadow-[var(--shadow-sm)]",
  cancelled: "border-[var(--color-error)] bg-[var(--surface-3)] text-[var(--color-error)] shadow-[var(--shadow-sm)]",
  completed: "border-[var(--color-success)] bg-[var(--surface-3)] text-[var(--color-success)] shadow-[var(--shadow-sm)]",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function BookingCard({ booking, onConfirm, onCancel, onReschedule }: BookingCardProps) {
  const statusClass = STATUS_BADGE[booking.status] ?? "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-primary)]";
  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;

  return (
    <article className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-md)] backdrop-blur-xl transition-shadow hover:shadow-[var(--shadow-lg)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">{booking.serviceName}</p>
          <p className="mt-1 text-[12px] font-medium text-[var(--text-secondary)]">
            {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-2.5 text-xs">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Staff</dt>
          <dd className="mt-0.5 text-[13px] font-medium text-[var(--text-secondary)]">{booking.staffName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Reserva ID</dt>
          <dd className="mt-0.5 font-mono text-[11px] font-medium text-[var(--text-secondary)]">{booking.id.slice(0, 8)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-11 rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] px-4 text-[13px] font-bold tracking-tight text-[var(--surface-3)] shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-11 rounded-xl bg-[var(--color-error)] px-4 text-[13px] font-bold tracking-tight text-[var(--surface-3)] shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] border border-[var(--border-soft)] disabled:pointer-events-none disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 text-[13px] font-bold tracking-tight text-[var(--text-secondary)] shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all hover:bg-[var(--surface-3)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)]"
        >
          Reprogramar
        </button>
      </div>
    </article>
  );
}
