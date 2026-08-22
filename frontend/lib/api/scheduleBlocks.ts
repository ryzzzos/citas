import type { ScheduleBlock, ScheduleBlockInput } from "@/types";
import { request } from "./client";

export interface ListScheduleBlocksParams {
  branch_id?: string;
  from_date?: string;
  to_date?: string;
  staff_id?: string;
}

export async function listScheduleBlocks(
  businessId: string,
  params?: ListScheduleBlocksParams
): Promise<ScheduleBlock[]> {
  const query = new URLSearchParams();
  if (params?.branch_id) query.set("branch_id", params.branch_id);
  if (params?.from_date) query.set("from_date", params.from_date);
  if (params?.to_date) query.set("to_date", params.to_date);
  if (params?.staff_id) query.set("staff_id", params.staff_id);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/schedule-blocks/${businessId}?${queryString}`
    : `/schedule-blocks/${businessId}`;

  return request<ScheduleBlock[]>(endpoint);
}

export async function createScheduleBlock(
  businessId: string,
  data: ScheduleBlockInput
): Promise<ScheduleBlock> {
  return request<ScheduleBlock>(`/schedule-blocks/${businessId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteScheduleBlock(
  businessId: string,
  blockId: string
): Promise<void> {
  return request<void>(`/schedule-blocks/${businessId}/${blockId}`, {
    method: "DELETE",
  });
}
