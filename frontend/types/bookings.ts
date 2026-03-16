export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  service_id: string;
  staff_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
}
