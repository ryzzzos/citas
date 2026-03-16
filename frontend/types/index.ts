export type UserRole = "customer" | "business_owner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  is_active: boolean;
}

export interface Staff {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface Schedule {
  id: string;
  business_id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

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

export interface AuthToken {
  access_token: string;
  token_type: string;
}
