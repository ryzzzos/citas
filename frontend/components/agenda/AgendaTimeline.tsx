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
  if (status === "pending") return "border-amber-400/70 bg-amber-400/10 text-amber-100";
  if (status === "confirmed") return "border-emerald-400/70 bg-emerald-400/10 text-emerald-100";
  if (status === "completed") return "border-sky-400/70 bg-sky-400/10 text-sky-100";
  return "border-rose-400/70 bg-rose-400/10 text-rose-100";
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
      className={`absolute overflow-hidden rounded-xl border p-2 shadow-[0_15px_30px_-20px_rgba(0,0,0,0.95)] backdrop-blur-sm ${getBookingTone(
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
      <p className="mt-1 text-[11px] text-zinc-200/90">
        {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
      </p>
      <p className="truncate text-[10px] text-zinc-300/90">{booking.staffName}</p>

      <div className="mt-1.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-7 rounded-md border border-white/30 bg-white/10 px-1.5 text-[10px] font-semibold text-zinc-100 disabled:opacity-40"
        >
          Ok
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-7 rounded-md border border-white/30 bg-white/10 px-1.5 text-[10px] font-semibold text-zinc-100 disabled:opacity-40"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-7 rounded-md border border-white/30 bg-white/10 px-1.5 text-[10px] font-semibold text-zinc-100"
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
      className="flex h-full min-h-0 flex-col rounded-3xl border border-zinc-800 bg-zinc-900/75 p-3 sm:p-4"
    >
      <div className="min-h-0 overflow-auto">
        <div className="min-w-[880px]">
          <div className={`grid gap-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}>
            <div className="sticky left-0 top-0 z-40 rounded-xl border border-zinc-800 bg-zinc-900/95 px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 shadow-[6px_0_14px_-10px_rgba(0,0,0,0.9)]">
              Hora
            </div>
            {columns.map((column) => (
              <div
                key={column.isoDate}
                className={`sticky top-0 z-30 rounded-xl border px-3 py-2 text-sm backdrop-blur-sm ${
                  column.isToday
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-100"
                    : "border-zinc-700 bg-zinc-950/60 text-zinc-200"
                }`}
              >
                <p className="font-semibold">{column.dayLabel}</p>
                <p className="text-xs text-zinc-400">{column.dateLabel}</p>
              </div>
            ))}

            <div className="sticky left-0 z-20 relative rounded-xl border border-zinc-800 bg-zinc-950/96 shadow-[6px_0_14px_-10px_rgba(0,0,0,0.9)]">
              {hourMarkers.map((hour) => {
                const [hours] = hour.split(":");
                const top = (Number(hours) * 60 + 30) * PX_PER_MINUTE;
                return (
                  <div key={hour} className="absolute inset-x-0" style={{ top }}>
                    <p className="-translate-y-1/2 px-2 text-[11px] font-semibold text-zinc-500">{hour}</p>
                  </div>
                );
              })}
            </div>

            {columns.map((column) => {
              const positioned = layoutDayBookings(bookingsByDay[column.isoDate] ?? []);

              return (
                <div
                  key={column.isoDate}
                  className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/45"
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
                        className="pointer-events-none absolute inset-x-0 border-t border-dashed border-zinc-800"
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
