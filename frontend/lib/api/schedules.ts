import type { Schedule, UpdateStaffSchedulesInput } from "@/types";

import { request } from "./client";

export async function listSchedules(businessId: string): Promise<Schedule[]> {
  return request<Schedule[]>(`/schedules/${businessId}/schedules`);
}

export async function updateStaffSchedules(
  businessId: string,
  staffId: string,
  data: UpdateStaffSchedulesInput
): Promise<Schedule[]> {
  return request<Schedule[]>(`/schedules/${businessId}/schedules/staff/${staffId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
