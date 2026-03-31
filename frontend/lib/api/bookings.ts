import type { Booking } from "@/types";

import { request, toQueryString } from "./client";

export interface GetAvailabilityParams {
  business_id: string;
  staff_id: string;
  service_id: string;
  booking_date: string;
}

export interface CreateBookingInput {
  business_id: string;
  service_id: string;
  staff_id: string;
  booking_date: string;
  start_time: string;
}

export type BookingStatusUpdate = "confirmed" | "cancelled" | "completed";

export interface BusinessAgendaQuery {
  timezone: string;
  from_at?: string;
  to_at?: string;
  booking_date?: string;
  statuses?: string[];
  staff_id?: string;
  service_id?: string;
  q?: string;
}

export async function getAvailability(
  params: GetAvailabilityParams
): Promise<string[]> {
  const query = toQueryString(params);
  return request<string[]>(`/bookings/availability?${query}`);
}

export async function createBooking(data: CreateBookingInput): Promise<Booking> {
  return request<Booking>("/bookings/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function myBookings(): Promise<Booking[]> {
  return request<Booking[]>("/bookings/my");
}

export async function businessAgenda(
  businessId: string,
  query: BusinessAgendaQuery
): Promise<Booking[]> {
  const params = new URLSearchParams();

  params.set("timezone", query.timezone);
  if (query.from_at) params.set("from_at", query.from_at);
  if (query.to_at) params.set("to_at", query.to_at);
  if (query.booking_date) params.set("booking_date", query.booking_date);
  if (query.staff_id) params.set("staff_id", query.staff_id);
  if (query.service_id) params.set("service_id", query.service_id);
  if (query.q) params.set("q", query.q);

  for (const status of query.statuses ?? []) {
    params.append("statuses", status);
  }

  return request<Booking[]>(`/bookings/business/${businessId}?${params.toString()}`);
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatusUpdate
): Promise<Booking> {
  return request<Booking>(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
