import type {
  Business,
  BusinessImageUpload,
  BusinessMapResponse,
  BusinessSlugAvailability,
  UpdateBusinessInput,
} from "@/types";

import { request, toQueryString } from "./client";

export interface ListBusinessesParams {
  city?: string;
  category?: string;
}

export interface ListBusinessesMapParams {
  north: number;
  south: number;
  east: number;
  west: number;
  city?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface CreateBusinessInput {
  name: string;
  description?: string | null;
  slug?: string | null;
  category: string;
  phone: string;
  whatsapp_phone?: string | null;
  email: string;
  public_bio?: string | null;
  cover_image_url?: string | null;
  logo_image_url?: string | null;
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

export async function listBusinessesMap(params: ListBusinessesMapParams): Promise<BusinessMapResponse> {
  const query = toQueryString(params);
  return request<BusinessMapResponse>(`/businesses/map?${query}`);
}

export async function getBusiness(id: string): Promise<Business> {
  return request<Business>(`/businesses/${id}`);
}

export async function getBusinessBySlug(slug: string): Promise<Business> {
  return request<Business>(`/businesses/slug/${slug}`);
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

export async function updateBusiness(
  businessId: string,
  data: UpdateBusinessInput
): Promise<Business> {
  return request<Business>(`/businesses/${businessId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function checkBusinessSlugAvailability(
  slug: string,
  excludeBusinessId?: string
): Promise<BusinessSlugAvailability> {
  const query = toQueryString({ slug, exclude_business_id: excludeBusinessId });
  return request<BusinessSlugAvailability>(`/businesses/slug/availability?${query}`);
}

async function uploadBusinessImage(
  businessId: string,
  kind: "cover" | "logo",
  file: File
): Promise<BusinessImageUpload> {
  const formData = new FormData();
  formData.append("file", file);

  return request<BusinessImageUpload>(`/businesses/${businessId}/${kind}-image`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadBusinessCoverImage(
  businessId: string,
  file: File
): Promise<BusinessImageUpload> {
  return uploadBusinessImage(businessId, "cover", file);
}

export async function uploadBusinessLogoImage(
  businessId: string,
  file: File
): Promise<BusinessImageUpload> {
  return uploadBusinessImage(businessId, "logo", file);
}
