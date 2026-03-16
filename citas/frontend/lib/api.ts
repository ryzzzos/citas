import type {
  AuthToken,
  Booking,
  Business,
  Schedule,
  Service,
  Staff,
  User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthToken> {
  const token = await request<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("access_token", token.access_token);
  return token;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "business_owner";
}): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function logout() {
  localStorage.removeItem("access_token");
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getMe(): Promise<User> {
  return request<User>("/users/me");
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export async function listBusinesses(params?: {
  city?: string;
  category?: string;
}): Promise<Business[]> {
  const qs = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][]
  ).toString();
  return request<Business[]>(`/businesses${qs ? `?${qs}` : ""}`);
}

export async function getBusiness(id: string): Promise<Business> {
  return request<Business>(`/businesses/${id}`);
}

export async function createBusiness(data: Partial<Business>): Promise<Business> {
  return request<Business>("/businesses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Services ────────────────────────────────────────────────────────────────

export async function listServices(businessId: string): Promise<Service[]> {
  return request<Service[]>(`/services/${businessId}/services`);
}

export async function createService(
  businessId: string,
  data: Partial<Service>
): Promise<Service> {
  return request<Service>(`/services/${businessId}/services`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Staff ───────────────────────────────────────────────────────────────────

export async function listStaff(businessId: string): Promise<Staff[]> {
  return request<Staff[]>(`/staff/${businessId}/staff`);
}

export async function createStaff(
  businessId: string,
  data: Partial<Staff>
): Promise<Staff> {
  return request<Staff>(`/staff/${businessId}/staff`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Schedules ───────────────────────────────────────────────────────────────

export async function listSchedules(businessId: string): Promise<Schedule[]> {
  return request<Schedule[]>(`/schedules/${businessId}/schedules`);
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function getAvailability(params: {
  business_id: string;
  staff_id: string;
  service_id: string;
  booking_date: string;
}): Promise<string[]> {
  const qs = new URLSearchParams(params).toString();
  return request<string[]>(`/bookings/availability?${qs}`);
}

export async function createBooking(data: {
  business_id: string;
  service_id: string;
  staff_id: string;
  booking_date: string;
  start_time: string;
}): Promise<Booking> {
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
  const qs = date ? `?booking_date=${date}` : "";
  return request<Booking[]>(`/bookings/business/${businessId}${qs}`);
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<Booking> {
  return request<Booking>(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
