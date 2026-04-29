import type { AgendaBooking } from "@/lib/agenda/types";

interface BookingCardProps {
  booking: AgendaBooking;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "border-amber-200/60 bg-amber-500/10 text-amber-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  confirmed: "border-blue-200/60 bg-blue-500/10 text-blue-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  cancelled: "border-rose-200/60 bg-rose-500/10 text-rose-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  completed: "border-slate-200/60 bg-slate-500/10 text-slate-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function BookingCard({ booking, onConfirm, onCancel, onReschedule }: BookingCardProps) {
  const statusClass = STATUS_BADGE[booking.status] ?? "border-slate-200 bg-slate-100 text-slate-800";
  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;

  return (
    <article className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-shadow hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">{booking.serviceName}</p>
          <p className="mt-1 text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      <dl className="mt-4 grid grid-cols-1 gap-2.5 text-xs">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Staff</dt>
          <dd className="mt-0.5 text-[13px] font-medium text-slate-700 dark:text-slate-300">{booking.staffName}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Reserva ID</dt>
          <dd className="mt-0.5 font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">{booking.id.slice(0, 8)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-11 rounded-xl border border-[rgba(255,255,255,0.4)] bg-[var(--app-primary-gradient)] px-4 text-[13px] font-bold tracking-tight text-white shadow-[0_4px_14px_-6px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-11 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 px-4 text-[13px] font-bold tracking-tight text-white shadow-[0_4px_14px_-6px_rgba(225,29,72,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.1)] border-x-transparent disabled:pointer-events-none disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-11 rounded-xl border border-zinc-200/80 bg-zinc-50/50 px-4 text-[13px] font-bold tracking-tight text-zinc-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05),inset_0_1px_rgba(255,255,255,0.5)] backdrop-blur-sm transition-all hover:bg-white hover:shadow-sm active:scale-[0.98] dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
        >
          Reprogramar
        </button>
      </div>
    </article>
  );
}
