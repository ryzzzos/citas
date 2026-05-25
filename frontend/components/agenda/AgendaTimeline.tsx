import { useEffect, useState } from "react";
import { DateTime } from "luxon";
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
  if (status === "pending") return "border-l-4 border-l-[var(--color-pending)] border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--color-pending)_10%,var(--surface-3))] dark:bg-[color-mix(in_srgb,var(--color-pending)_18%,var(--surface-3))] text-[var(--color-pending)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]";
  if (status === "confirmed") return "border-l-4 border-l-[var(--color-info)] border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--color-info)_10%,var(--surface-3))] dark:bg-[color-mix(in_srgb,var(--color-info)_18%,var(--surface-3))] text-[var(--color-info)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]";
  if (status === "completed") return "border-l-4 border-l-[var(--color-success)] border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--color-success)_10%,var(--surface-3))] dark:bg-[color-mix(in_srgb,var(--color-success)_18%,var(--surface-3))] text-[var(--color-success)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]";
  return "border-l-4 border-l-[var(--color-error)] border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--color-error)_10%,var(--surface-3))] dark:bg-[color-mix(in_srgb,var(--color-error)_18%,var(--surface-3))] text-[var(--color-error)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]";
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
      className={`absolute group overflow-hidden rounded-2xl border-solid p-2.5 transition-all hover:z-10 hover:scale-[1.01] ${getBookingTone(
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
      <p className="truncate text-[13px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">{booking.serviceName}</p>
      <p className="mt-1 text-[11px] font-medium text-current/80">
        {booking.startAt.toFormat("HH:mm")} - {booking.endAt.toFormat("HH:mm")}
      </p>
      <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-widest text-current/60">{booking.staffName}</p>

      <div className="mt-2.5 flex flex-wrap gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
        <button
          type="button"
          onClick={() => onConfirm(booking.id)}
          disabled={booking.status !== "pending"}
          className="min-h-7 rounded-xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] px-2 text-[10px] font-bold tracking-tight text-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          Ok
        </button>
        <button
          type="button"
          onClick={() => onCancel(booking.id)}
          disabled={booking.status === "cancelled" || booking.status === "completed"}
          className="min-h-7 rounded-xl border border-[var(--border-soft)] bg-[var(--color-error)] px-2 text-[10px] font-bold tracking-tight text-[var(--surface-3)] shadow-[var(--shadow-sm)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => onReschedule(booking.id)}
          className="min-h-7 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-2 text-[10px] font-bold tracking-tight text-current shadow-[var(--shadow-sm)] backdrop-blur-sm transition-all hover:bg-[var(--surface-2)] active:scale-[0.98] dark:border-[var(--border-strong)] dark:hover:bg-[var(--surface-2)]"
        >
          R
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

  const top = (now.hour * 60 + now.minute) * PX_PER_MINUTE;

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
  const hourMarkers = timelineSlots.filter((slot) => slot.endsWith(":00"));
  const canvasHeight = 24 * 60 * PX_PER_MINUTE;

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
                const top = Number(hours) * 60 * PX_PER_MINUTE;
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
                    const top = Number(hours) * 60 * PX_PER_MINUTE;
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
