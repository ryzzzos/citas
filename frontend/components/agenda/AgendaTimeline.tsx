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
  if (status === "pending") return "border-amber-200/60 bg-amber-500/10 text-amber-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
  if (status === "confirmed") return "border-blue-200/60 bg-blue-500/10 text-blue-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
  if (status === "completed") return "border-slate-200/60 bg-slate-500/10 text-slate-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300";
  return "border-rose-200/60 bg-rose-500/10 text-rose-700 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
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
      className={`absolute group overflow-hidden rounded-2xl border p-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all hover:z-10 hover:scale-[1.02] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.15)] ${getBookingTone(
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
      <p className="truncate text-[13px] font-bold leading-tight tracking-tight">{booking.serviceName}</p>
      <p className="mt-1 text-[11px] font-medium text-current/80">
        {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
      </p>
      <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-current/60">{booking.staffName}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-7 rounded-xl border border-[rgba(255,255,255,0.4)] bg-[var(--app-primary-gradient)] px-2 text-[10px] font-bold tracking-tight text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          Ok
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-7 rounded-xl border border-t-[rgba(255,255,255,0.1)] border-b-[rgba(0,0,0,0.1)] border-x-transparent bg-gradient-to-b from-rose-500 to-rose-600 px-2 text-[10px] font-bold tracking-tight text-white shadow-[0_2px_8px_-2px_rgba(225,29,72,0.4),inset_0_1px_rgba(255,255,255,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-7 rounded-xl border border-white/60 bg-white/50 px-2 text-[10px] font-bold tracking-tight text-current shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05),inset_0_1px_rgba(255,255,255,0.5)] backdrop-blur-sm transition-all hover:bg-white active:scale-[0.98] dark:border-white/10 dark:bg-black/20 dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)] dark:hover:bg-black/40"
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
      className="flex h-full min-h-0 flex-col rounded-3xl border border-white/50 bg-white/60 p-4 shadow-[0_8px_32px_-12px_rgba(37,99,235,0.08)] backdrop-blur-2xl sm:p-5 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]"
    >
      <div className="min-h-0 overflow-auto">
        <div className="min-w-[880px]">
            <div className={`grid gap-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}>
            <div className="sticky left-0 top-0 z-40 bg-[inherit] px-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Hora
            </div>
            {columns.length > 1 && columns.map((column) => (
              <div
                key={column.isoDate}
                className={`sticky top-0 z-30 rounded-2xl border px-3 py-2 text-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] backdrop-blur-sm ${
                  column.isToday
                    ? "border-blue-200/60 bg-blue-500/10 text-blue-900 shadow-[inset_0_1px_rgba(255,255,255,0.4)] dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100"
                    : "border-zinc-200/60 bg-zinc-50/70 text-slate-500 dark:border-zinc-800/60 dark:bg-zinc-900/50 dark:text-slate-400"
                }`}
              >
                <p className="font-bold tracking-tight text-slate-900 dark:text-white">{column.dayLabel}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--app-primary)] dark:text-blue-400">{column.dateLabel}</p>
              </div>
            ))}
            {columns.length === 1 && <div className="sticky top-0 z-30 pointer-events-none"></div>}

            <div className="sticky left-0 z-20 relative bg-[inherit]">
              {hourMarkers.map((hour) => {
                const [hours] = hour.split(":");
                const top = (Number(hours) * 60 + 30) * PX_PER_MINUTE;
                return (
                  <div key={hour} className="absolute inset-x-0" style={{ top }}>
                    <p className="-translate-y-1/2 px-2 text-[11px] font-bold tracking-widest text-slate-400">{hour}</p>
                  </div>
                );
              })}
            </div>

            {columns.map((column) => {
              const positioned = layoutDayBookings(bookingsByDay[column.isoDate] ?? []);

              return (
                <div
                  key={column.isoDate}
                  className="relative overflow-hidden rounded-2xl border border-zinc-200/40 bg-white/40 shadow-[inset_0_1px_rgba(255,255,255,0.2)] dark:border-zinc-800/40 dark:bg-black/10 dark:shadow-[inset_0_1px_rgba(0,0,0,0.2)]"
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
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-zinc-200 dark:border-zinc-800"
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
