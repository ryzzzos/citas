import type { Business } from "@/types";

import { request, toQueryString } from "./client";

export interface ListBusinessesParams {
  city?: string;
  category?: string;
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

export async function createBusiness(data: Partial<Business>): Promise<Business> {
  return request<Business>("/businesses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
