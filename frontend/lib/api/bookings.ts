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
  date?: string
): Promise<Booking[]> {
  const query = toQueryString({ booking_date: date });
  return request<Booking[]>(`/bookings/business/${businessId}${query ? `?${query}` : ""}`);
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
