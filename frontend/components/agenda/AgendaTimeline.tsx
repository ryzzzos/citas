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
      top: current.start * PX_PER_MINUTE,
      height: Math.max(40, (current.end - current.start) * PX_PER_MINUTE),
    };
  });
}

function getBookingTone(status: AgendaBooking["status"]): string {
  if (status === "pending") return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100";
  if (status === "confirmed") return "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-500/35 dark:bg-teal-500/15 dark:text-teal-100";
  if (status === "completed") return "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/35 dark:bg-sky-500/15 dark:text-sky-100";
  return "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-100";
}

function renderEventBlock(
  item: PositionedBooking,
  onConfirm: (bookingId: string) => void,
  onCancel: (bookingId: string) => void,
  onReschedule: (bookingId: string) => void
) {
  const widthPercent = 100 / item.laneCount;
  const leftPercent = item.lane * widthPercent;
  const booking = item.booking;

  return (
    <article
      key={booking.id}
      className={`absolute overflow-hidden rounded-[var(--dashboard-radius-md)] border p-2 shadow-[var(--dashboard-shadow-sm)] ${getBookingTone(
        booking.status
      )}`}
      style={{
        top: item.top,
        height: item.height,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
      }}
      role="article"
      aria-label={`${booking.serviceName} ${booking.startAt.toFormat("HH:mm")} a ${booking.endAt.toFormat("HH:mm")}`}
    >
      <p className="truncate text-xs font-semibold leading-tight">{booking.serviceName}</p>
      <p className="mt-1 text-[11px] text-current/85">
        {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
      </p>
      <p className="truncate text-[10px] text-current/70">{booking.staffName}</p>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="dashboard-interactive dashboard-focusable min-h-7 rounded-[var(--dashboard-radius-sm)] border border-current/25 bg-white/60 px-1.5 text-[10px] font-semibold text-current disabled:opacity-40 dark:bg-slate-950/35"
        >
          Ok
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="dashboard-interactive dashboard-focusable min-h-7 rounded-[var(--dashboard-radius-sm)] border border-current/25 bg-white/60 px-1.5 text-[10px] font-semibold text-current disabled:opacity-40 dark:bg-slate-950/35"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="dashboard-interactive dashboard-focusable min-h-7 rounded-[var(--dashboard-radius-sm)] border border-current/25 bg-white/60 px-1.5 text-[10px] font-semibold text-current dark:bg-slate-950/35"
        >
          R
        </button>
      </div>
    </article>
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
  const hourMarkers = timelineSlots.filter((slot) => slot.endsWith(":00"));
  const canvasHeight = 24 * 60 * PX_PER_MINUTE;

  return (
    <section
      aria-label="Timeline de citas"
      className="dashboard-surface-1 flex h-full min-h-0 flex-col p-3 sm:p-4"
    >
      <div className="min-h-0 overflow-auto">
        <div className="min-w-[880px]">
          <div className={`grid gap-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}>
            <div className="dashboard-surface-2 dashboard-text-muted sticky left-0 top-0 z-40 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
              Hora
            </div>
            {columns.map((column) => (
              <div
                key={column.isoDate}
                className={`sticky top-0 z-30 rounded-[var(--dashboard-radius-md)] border px-3 py-2 text-sm ${
                  column.isToday
                    ? "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-500/35 dark:bg-teal-500/15 dark:text-teal-100"
                    : "border-[color:var(--dashboard-border-subtle)] bg-[color:var(--dashboard-surface-2)] [color:var(--dashboard-text-secondary)]"
                }`}
              >
                <p className="font-semibold">{column.dayLabel}</p>
                <p className="dashboard-text-muted text-xs">{column.dateLabel}</p>
              </div>
            ))}

            <div className="dashboard-surface-2 sticky left-0 z-20 relative">
              {hourMarkers.map((hour) => {
                const [hours] = hour.split(":");
                const top = (Number(hours) * 60 + 30) * PX_PER_MINUTE;
                return (
                  <div key={hour} className="absolute inset-x-0" style={{ top }}>
                    <p className="dashboard-text-muted -translate-y-1/2 px-2 text-[11px] font-semibold">{hour}</p>
                  </div>
                );
              })}
            </div>

            {columns.map((column) => {
              const positioned = layoutDayBookings(bookingsByDay[column.isoDate] ?? []);

              return (
                <div
                  key={column.isoDate}
                  className="relative overflow-hidden rounded-[var(--dashboard-radius-md)] border border-[color:var(--dashboard-border-subtle)] bg-[color:color-mix(in_oklab,var(--dashboard-surface-2)_86%,transparent)]"
                  style={{ height: canvasHeight }}
                  role="group"
                  aria-label={`${column.dayLabel} ${column.dateLabel}`}
                >
                  {hourMarkers.map((hour) => {
                    const [hours] = hour.split(":");
                    const top = Number(hours) * 60 * PX_PER_MINUTE;
                    return (
                      <div
                        key={`${column.isoDate}-${hour}`}
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[color:var(--dashboard-border-subtle)]"
                        style={{ top }}
                        aria-hidden="true"
                      />
                    );
                  })}

                  {positioned.map((item) => renderEventBlock(item, onConfirm, onCancel, onReschedule))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
