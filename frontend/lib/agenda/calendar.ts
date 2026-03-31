import { DateTime } from "luxon";

import type { Booking, Service, Staff } from "@/types";

import type { AgendaBooking, AgendaDayColumn, AgendaView } from "./types";

const DEFAULT_BUSINESS_TIMEZONE = "UTC";

export function getCanonicalTimezone(): string {
  return process.env.NEXT_PUBLIC_BUSINESS_TIMEZONE ?? DEFAULT_BUSINESS_TIMEZONE;
}

export function getNowInTimezone(timezone: string): DateTime {
  return DateTime.now().setZone(timezone);
}

export function getViewRange(anchorDate: DateTime, view: AgendaView): { fromAt: DateTime; toAt: DateTime } {
  if (view === "day") {
    const fromAt = anchorDate.startOf("day");
    return { fromAt, toAt: fromAt.plus({ days: 1 }) };
  }

  if (view === "week") {
    const fromAt = anchorDate.startOf("week");
    return { fromAt, toAt: fromAt.plus({ days: 7 }) };
  }

  const fromAt = anchorDate.startOf("month");
  return { fromAt, toAt: fromAt.plus({ months: 1 }) };
}

export function shiftAnchorDate(anchorDate: DateTime, view: AgendaView, direction: -1 | 1): DateTime {
  if (view === "day") {
    return anchorDate.plus({ days: direction });
  }
  if (view === "week") {
    return anchorDate.plus({ weeks: direction });
  }
  return anchorDate.plus({ months: direction });
}

export function getAgendaDayColumns(anchorDate: DateTime, view: AgendaView, timezone: string): AgendaDayColumn[] {
  const now = getNowInTimezone(timezone).startOf("day");
  const range = getViewRange(anchorDate, view);
  const dayCount = Math.max(1, Math.ceil(range.toAt.diff(range.fromAt, "days").days));

  return Array.from({ length: dayCount }).map((_, index) => {
    const current = range.fromAt.plus({ days: index });

    return {
      isoDate: current.toISODate() ?? "",
      dayLabel: current.toFormat("ccc"),
      dateLabel: current.toFormat("dd LLL"),
      isToday: current.hasSame(now, "day"),
    };
  });
}

export function getTimelineSlots(stepMinutes = 60): string[] {
  const labels: string[] = [];

  for (let minute = 0; minute < 24 * 60; minute += stepMinutes) {
    const hour = Math.floor(minute / 60);
    const mins = minute % 60;
    labels.push(`${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`);
  }

  return labels;
}

export function toAgendaBooking(
  booking: Booking,
  timezone: string,
  staffById: Map<string, Staff>,
  serviceById: Map<string, Service>
): AgendaBooking {
  const startAt = DateTime.fromISO(`${booking.booking_date}T${booking.start_time}`, { zone: timezone });
  const endAt = DateTime.fromISO(`${booking.booking_date}T${booking.end_time}`, { zone: timezone });

  return {
    ...booking,
    startAt,
    endAt,
    isValidTime: startAt.isValid && endAt.isValid && endAt > startAt,
    staffName: staffById.get(booking.staff_id)?.name ?? "Staff no asignado",
    serviceName: serviceById.get(booking.service_id)?.name ?? "Servicio no asignado",
  };
}

export function formatViewLabel(anchorDate: DateTime, view: AgendaView): string {
  if (view === "day") {
    return anchorDate.toFormat("cccc, dd LLL yyyy");
  }

  if (view === "week") {
    const start = anchorDate.startOf("week");
    const end = start.plus({ days: 6 });
    return `${start.toFormat("dd LLL")} - ${end.toFormat("dd LLL yyyy")}`;
  }

  return anchorDate.toFormat("LLLL yyyy");
}
