import type { Business } from "@/types";

import { request, toQueryString } from "./client";

export interface ListBusinessesParams {
  city?: string;
  category?: string;
}

export interface CreateBusinessInput {
  name: string;
  description?: string | null;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function listBusinesses(
  params: ListBusinessesParams = {}
): Promise<Business[]> {
  const query = toQueryString(params);
  return request<Business[]>(`/businesses${query ? `?${query}` : ""}`);
}

export async function getBusiness(id: string): Promise<Business> {
  return request<Business>(`/businesses/${id}`);
}

export async function getMyBusiness(): Promise<Business> {
  return request<Business>("/businesses/me");
}

export async function createBusiness(data: CreateBusinessInput): Promise<Business> {
  return request<Business>("/businesses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
