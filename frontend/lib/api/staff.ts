import type { Staff } from "@/types";

import { request } from "./client";

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
