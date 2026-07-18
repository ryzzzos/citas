export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  branch_id?: string | null;
  service_id: string;
  staff_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  service_name?: string;
  staff_name?: string;
  branch_name?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_whatsapp?: string;
  notes?: string;
  created_at?: string;
  confirmed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  paid_at?: string | null;
  payment?: {
    id: string;
    amount: number;
    status: string;
    payment_method: string;
  } | null;
}
