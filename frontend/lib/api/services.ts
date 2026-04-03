import type {
  CreateServiceInput,
  ListServicesParams,
  Service,
  UpdateServiceInput,
} from "@/types";

import { request, toQueryString } from "./client";

function normalizeApiError(error: unknown, fallback: string): Error {
  if (error instanceof Error && error.message) {
    return new Error(error.message);
  }
  return new Error(fallback);
}

export async function createService(
  businessId: string,
  data: CreateServiceInput
): Promise<Service> {
  try {
    return await request<Service>(`/services/${businessId}/services`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw normalizeApiError(error, "No se pudo crear el servicio.");
  }
}

export async function listServices(
  businessId: string,
  params: ListServicesParams = {}
): Promise<Service[]> {
  const query = toQueryString({ include_inactive: params.includeInactive });
  try {
    return await request<Service[]>(
      `/services/${businessId}/services${query ? `?${query}` : ""}`
    );
  } catch (error) {
    throw normalizeApiError(error, "No se pudieron cargar los servicios.");
  }
}

export async function updateService(
  businessId: string,
  serviceId: string,
  data: UpdateServiceInput
): Promise<Service> {
  try {
    return await request<Service>(`/services/${businessId}/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw normalizeApiError(error, "No se pudo actualizar el servicio.");
  }
}

export async function deleteService(
  businessId: string,
  serviceId: string
): Promise<void> {
  try {
    await request<void>(`/services/${businessId}/services/${serviceId}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw normalizeApiError(error, "No se pudo eliminar el servicio.");
  }
}

export async function toggleServiceActive(
  businessId: string,
  serviceId: string,
  nextIsActive: boolean
): Promise<Service> {
  return updateService(businessId, serviceId, { is_active: nextIsActive });
}

export async function uploadServiceImage(
  businessId: string,
  file: File
): Promise<{ image_url: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    return await request<{ image_url: string }>(`/services/${businessId}/image`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw normalizeApiError(error, "No se pudo subir la imagen.");
  }
}
