import type { DateTime } from "luxon";

import type { Booking, BookingStatus, Service, Staff } from "@/types";

export type AgendaView = "day" | "week" | "month";

export interface AgendaFilters {
  status: BookingStatus | "all";
  staffId: string | "all";
  serviceId: string | "all";
  query: string;
}

export interface AgendaDayColumn {
  isoDate: string;
  dayLabel: string;
  dateLabel: string;
  isToday: boolean;
}

export interface AgendaBooking extends Booking {
  startAt: DateTime;
  endAt: DateTime;
  staffName: string;
  serviceName: string;
  isValidTime: boolean;
}

export interface AgendaDataSnapshot {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
}
