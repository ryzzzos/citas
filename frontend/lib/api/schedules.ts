import type { Schedule } from "@/types";

import { request } from "./client";

export async function listSchedules(businessId: string): Promise<Schedule[]> {
  return request<Schedule[]>(`/schedules/${businessId}/schedules`);
}
