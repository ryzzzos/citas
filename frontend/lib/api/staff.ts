import type { Staff } from "@/types";

import { request } from "./client";

import { toQueryString } from "./client";

export async function listStaff(businessId: string, branchId?: string): Promise<Staff[]> {
  const query = branchId ? `?${toQueryString({ branch_id: branchId })}` : "";
  return request<Staff[]>(`/staff/${businessId}/staff${query}`);
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

export async function updateStaff(
  businessId: string,
  staffId: string,
  data: Partial<Staff>
): Promise<Staff> {
  return request<Staff>(`/staff/${businessId}/staff/${staffId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStaff(
  businessId: string,
  staffId: string
): Promise<void> {
  return request<void>(`/staff/${businessId}/staff/${staffId}`, {
    method: "DELETE",
  });
}

export async function uploadStaffPhoto(
  businessId: string,
  staffId: string,
  file: File
): Promise<Staff> {
  const formData = new FormData();
  formData.append("file", file);

  return request<Staff>(`/staff/${businessId}/staff/${staffId}/photo`, {
    method: "POST",
    body: formData,
  });
}
