import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { Clock, User, Check, X as XIcon, CalendarClock, Phone, Mail, MessageSquare, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgendaBooking, AgendaDayColumn } from "@/lib/agenda/types";

interface AgendaTimelineProps {
  columns: AgendaDayColumn[];
  bookingsByDay: Record<string, AgendaBooking[]>;
  timelineSlots: string[];
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const PX_PER_MINUTE = 1.2;

interface PositionedBooking {
  booking: AgendaBooking;
  lane: number;
  laneCount: number;
  top: number;
  height: number;
}

function toMinutes(booking: AgendaBooking): { start: number; end: number } {
  const start = booking.startAt.hour * 60 + booking.startAt.minute;
  const end = booking.endAt.hour * 60 + booking.endAt.minute;
  return { start, end: Math.max(end, start + 15) };
}

function layoutDayBookings(bookings: AgendaBooking[]): PositionedBooking[] {
  const sorted = [...bookings].sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
  const laneById = new Map<string, number>();
  const active: Array<{ bookingId: string; end: number; lane: number }> = [];

  for (const booking of sorted) {
    const { start, end } = toMinutes(booking);

    for (let index = active.length - 1; index >= 0; index -= 1) {
      if (active[index].end <= start) {
        active.splice(index, 1);
      }
    }

    const usedLanes = new Set(active.map((item) => item.lane));
    let lane = 0;
    while (usedLanes.has(lane)) {
      lane += 1;
    }

    laneById.set(booking.id, lane);
    active.push({ bookingId: booking.id, end, lane });
  }

  return sorted.map((booking) => {
    const current = toMinutes(booking);
    const lane = laneById.get(booking.id) ?? 0;

    let laneCount = 1;
    for (const candidate of sorted) {
      const other = toMinutes(candidate);
      const overlaps = current.start < other.end && other.start < current.end;
      if (!overlaps) continue;

      const candidateLane = laneById.get(candidate.id) ?? 0;
      laneCount = Math.max(laneCount, candidateLane + 1);
    }

    return {
      booking,
      lane,
      laneCount,
      top: (current.start - 6 * 60) * PX_PER_MINUTE,                                                       
      height: Math.max(40, (current.end - current.start) * PX_PER_MINUTE),
    };
  });
}

/* ── Status → CSS variable name mapping ────────────────────────── */
const STATUS_VAR: Record<string, string> = {
  pending: "--color-pending",
  confirmed: "--color-info",
  completed: "--color-success",
  cancelled: "--color-error",
};

function getBookingTone(status: AgendaBooking["status"]): string {
  const v = STATUS_VAR[status] ?? "--color-pending";
  return [
    /* border – blended with system border for subtle but visible edge */
    `border-[color-mix(in_srgb,var(${v})_35%,var(--border-strong))]`,
    /* background – 15% tint in light, 22% in dark for stronger presence */
    `bg-[color-mix(in_srgb,var(${v})_15%,var(--surface-3))]`,
    `dark:bg-[color-mix(in_srgb,var(${v})_22%,var(--surface-3))]`,
    /* accent text color inherited by children via currentColor */
    `text-[var(${v})]`,
    /* depth & hover lift */
    "shadow-[var(--shadow-sm)]",
    "hover:shadow-[var(--shadow-lg)]",
  ].join(" ");
}

function renderEventBlock(
  item: PositionedBooking,
  onConfirm: (bookingId: string) => void,
  onCancel: (bookingId: string) => void,
  onReschedule: (bookingId: string) => void,
  onSelect: (booking: AgendaBooking) => void
) {
  const widthPercent = 100 / item.laneCount;
  const leftPercent = item.lane * widthPercent;
  const booking = item.booking;
  const isCompact = item.height < 60;
  const statusVar = STATUS_VAR[booking.status] ?? "--color-pending";

  return (
    <article
      key={booking.id}
      onClick={() => onSelect(booking)}
      className={`absolute group overflow-hidden rounded-[var(--radius-sm)] border transition-all hover:z-10 hover:scale-[1.01] cursor-pointer ${isCompact ? "py-1.5 pl-3.5 pr-2" : "p-3 pl-4"} ${getBookingTone(booking.status)}`}
      style={{
        top: item.top,
        height: item.height,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      role="article"
      aria-label={`${booking.serviceName} ${booking.startAt.toFormat("HH:mm")} a ${booking.endAt.toFormat("HH:mm")}`}
    >
      {/* ── Left accent bar ── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-sm)]"
        style={{ backgroundColor: `var(${statusVar})` }}
        aria-hidden="true"
      />

      {isCompact ? (
        /* ── Compact layout (< 60px): single horizontal line ── */
        <div className="flex h-full items-center gap-2 overflow-hidden">
          <p className="min-w-0 flex-1 truncate text-[12px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            {booking.serviceName}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)]/60 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] backdrop-blur-sm dark:bg-[var(--surface-2)]/60">
            <Clock className="h-2.5 w-2.5 text-[var(--text-muted)]" />
            {booking.startAt.toFormat("HH:mm")}
          </span>
        </div>
      ) : (
        /* ── Standard layout (>= 60px): full vertical stack ── */
        <>
          <p className="truncate text-[13px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
            {booking.serviceName}
          </p>

          <span className="mt-1.5 inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)]/60 px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--text-secondary)] backdrop-blur-sm dark:bg-[var(--surface-2)]/60">
            <Clock className="h-3 w-3 text-[var(--text-muted)]" />
            {booking.startAt.toFormat("HH:mm")} – {booking.endAt.toFormat("HH:mm")}
          </span>

          <p className="mt-1.5 flex items-center gap-1 truncate text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            <User className="h-3 w-3 shrink-0" />
            {booking.staffName}
          </p>
        </>
      )}

      {/* ── Glassmorphic quick-action dock ── */}
      <div className={`absolute right-1.5 flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)]/90 p-0.5 opacity-0 shadow-[var(--shadow-md)] backdrop-blur-md transition-opacity group-hover:opacity-100 dark:bg-[var(--surface-2)]/90 ${isCompact ? "top-1/2 -translate-y-1/2" : "bottom-1.5"}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onConfirm(booking.id); }}
          disabled={booking.status !== "pending"}
          aria-label="Confirmar cita"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:brightness-110 active:scale-[0.92] disabled:pointer-events-none disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCancel(booking.id); }}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          aria-label="Cancelar cita"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--color-error)]/15 text-[var(--color-error)] transition-all hover:bg-[var(--color-error)]/25 active:scale-[0.92] disabled:pointer-events-none disabled:opacity-40"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onReschedule(booking.id); }}
          aria-label="Reprogramar cita"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.92] dark:bg-[var(--surface-3)] dark:hover:bg-[var(--surface-3)]/80"
        >
          <CalendarClock className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

function CurrentTimeLine() {
  const [now, setNow] = useState(DateTime.local());

  useEffect(() => {
    const interval = setInterval(() => setNow(DateTime.local()), 60000);
    return () => clearInterval(interval);
  }, []);

  const minutes = now.hour * 60 + now.minute;
  if (minutes < 6 * 60 || minutes > 22 * 60) return null;
  const top = (minutes - 6 * 60) * PX_PER_MINUTE;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
      style={{ top }}
    >
      <div className="absolute left-0 h-[7px] w-[7px] -translate-x-[3px] rounded-full bg-[var(--app-primary)] shadow-[0_0_6px_var(--app-primary)]" />
      <div className="h-[2px] w-full bg-[var(--app-primary)] opacity-80 shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

export default function AgendaTimeline({
  columns,
  bookingsByDay,
  timelineSlots,
  onConfirm,
  onCancel,
  onReschedule,
}: AgendaTimelineProps) {
  const [selectedBooking, setSelectedBooking] = useState<AgendaBooking | null>(null);
  const hourMarkers = timelineSlots.filter((slot) => slot.endsWith(":00"));
  const canvasHeight = (22 - 6) * 60 * PX_PER_MINUTE;

  return (
    <section
      aria-label="Timeline de citas"
      className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] sm:p-5 dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]"
    >
      <div className="min-h-0 overflow-auto">
        <div className="min-w-[880px]">
            <div className={`grid gap-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}>
            <div className="sticky left-0 top-0 z-40 bg-[inherit] px-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Hora
            </div>
            {columns.length > 1 && columns.map((column) => (
              <div
                key={column.isoDate}
                className={`sticky top-0 z-30 rounded-2xl border px-3 py-2 text-sm shadow-[var(--shadow-sm)] ${
                  column.isToday
                    ? "border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_8%,var(--surface-3))] text-[var(--app-primary)]"
                    : "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:text-[var(--text-muted)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`font-bold tracking-tight ${column.isToday ? "text-[var(--app-primary-strong)] dark:text-[var(--app-primary)]" : "text-[var(--text-primary)]"}`}>{column.dayLabel}</p>
                  {column.isToday && <span className="rounded-full bg-[var(--app-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--surface-3)]">Hoy</span>}
                </div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${column.isToday ? "text-[var(--app-primary)]" : "text-[var(--app-primary)]"}`}>{column.dateLabel}</p>
              </div>
            ))}
            {columns.length === 1 && <div className="sticky top-0 z-30 pointer-events-none"></div>}

            <div className="sticky left-0 z-20 relative bg-[inherit]">
              {hourMarkers.map((hour) => {
                const [hours] = hour.split(":");
                // Posicionar la etiqueta exactamente en la línea de la hora, no a la mitad (+30)
                const top = (Number(hours) - 6) * 60 * PX_PER_MINUTE;
                return (
                  <div key={hour} className="absolute inset-x-0" style={{ top }}>
                    <p className="-translate-y-1/2 px-2 text-[11px] font-bold tracking-widest text-[var(--text-muted)]">{hour}</p>
                  </div>
                );
              })}
            </div>

            {columns.map((column) => {
              const positioned = layoutDayBookings(bookingsByDay[column.isoDate] ?? []);

              return (
                <div
                  key={column.isoDate}
                  className="relative overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
                  style={{ height: canvasHeight }}
                  role="group"
                  aria-label={`${column.dayLabel} ${column.dateLabel}`}
                >
                  {hourMarkers.map((hour) => {
                    const [hours] = hour.split(":");
                    const top = (Number(hours) - 6) * 60 * PX_PER_MINUTE;
                    return (
                      <div
                        key={`${column.isoDate}-${hour}`}
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[var(--border-strong)]"
                        style={{ top }}
                        aria-hidden="true"
                      />
                    );
                  })}

                  {column.isToday && <CurrentTimeLine />}

                  {positioned.map((item) => renderEventBlock(item, onConfirm, onCancel, onReschedule, setSelectedBooking))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detailed Customer Drawer ── */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-50 bg-[var(--text-primary)]/10 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />

            {/* Side Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 right-0 z-55 flex w-[90vw] max-w-[400px] flex-col overflow-hidden rounded-l-[var(--radius-lg)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            >
              {/* Header */}
              <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] active:scale-95 border border-[var(--border-strong)] bg-[var(--surface-3)]/60"
                  >
                    <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                      Detalle de Cita
                    </p>
                    <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] truncate max-w-[200px]">
                      {selectedBooking.serviceName}
                    </h2>
                  </div>
                </div>
                {/* Status Badge */}
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  selectedBooking.status === "confirmed" ? "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20" :
                  selectedBooking.status === "completed" ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20" :
                  selectedBooking.status === "cancelled" ? "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20" :
                  "bg-[var(--color-pending)]/10 text-[var(--color-pending)] border border-[var(--color-pending)]/20"
                }`}>
                  {selectedBooking.status === "confirmed" ? "Confirmada" :
                   selectedBooking.status === "completed" ? "Completada" :
                   selectedBooking.status === "cancelled" ? "Cancelada" : "Pendiente"}
                </span>
              </header>

              {/* Body */}
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 space-y-6">
                {/* Time Slot & Staff */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                    <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {selectedBooking.startAt.toFormat("cccc, dd LLL yyyy")}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {selectedBooking.startAt.toFormat("HH:mm")} - {selectedBooking.endAt.toFormat("HH:mm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-strong)] pt-3">
                    <User className="h-4 w-4 text-[var(--text-muted)]" />
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {selectedBooking.staffName}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Profesional asignado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info Card */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Datos del Cliente
                  </h3>

                  <div className="space-y-1">
                    <p className="text-base font-bold text-[var(--text-primary)]">
                      {selectedBooking.customer_name ?? "Cliente sin nombre"}
                    </p>
                    {selectedBooking.customer_email && (
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {selectedBooking.customer_email}
                      </p>
                    )}
                  </div>

                  {/* Quick Contact Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {selectedBooking.customer_phone ? (
                      <a
                        href={`tel:${selectedBooking.customer_phone}`}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.98]"
                      >
                        <Phone className="h-4 w-4 text-[var(--color-info)]" />
                        Llamar
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-xs font-bold text-[var(--text-muted)] opacity-50">
                        <Phone className="h-4 w-4" />
                        Sin teléfono
                      </div>
                    )}

                    {selectedBooking.customer_whatsapp ? (
                      <a
                        href={`https://wa.me/${selectedBooking.customer_whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-xs font-bold text-[var(--text-primary)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.98]"
                      >
                        <MessageSquare className="h-4 w-4 text-[var(--color-success)]" />
                        WhatsApp
                      </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] py-2.5 text-xs font-bold text-[var(--text-muted)] opacity-50">
                        <MessageSquare className="h-4 w-4" />
                        Sin WhatsApp
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Notes */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Notas de Reserva
                  </h3>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)] italic">
                    {selectedBooking.notes || "Sin notas adicionales."}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-auto shrink-0 border-t border-[var(--border-strong)] bg-[var(--surface-1)] p-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  disabled={selectedBooking.status !== "pending"}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))] text-xs font-bold text-[var(--surface-3)] shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  Confirmar Cita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCancel(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  disabled={selectedBooking.status === "cancelled" || selectedBooking.status === "completed"}
                  className="px-4 py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] text-xs font-bold text-[var(--color-error)] transition-all hover:bg-[var(--color-error)]/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                >
                  Cancelar
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
