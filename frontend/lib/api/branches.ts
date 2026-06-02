import type { Branch, CreateBranchInput, UpdateBranchInput } from "@/types";
import { request } from "./client";

export async function listBranches(businessId: string): Promise<Branch[]> {
  return request<Branch[]>(`/businesses/${businessId}/branches`);
}

export async function createBranch(
  businessId: string,
  data: CreateBranchInput
): Promise<Branch> {
  return request<Branch>(`/businesses/${businessId}/branches`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBranch(
  businessId: string,
  branchId: string,
  data: UpdateBranchInput
): Promise<Branch> {
  return request<Branch>(`/businesses/${businessId}/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBranch(
  businessId: string,
  branchId: string
): Promise<void> {
  return request<void>(`/businesses/${businessId}/branches/${branchId}`, {
    method: "DELETE",
  });
}
