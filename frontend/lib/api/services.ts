import type { Service } from "@/types";

import { request } from "./client";

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
