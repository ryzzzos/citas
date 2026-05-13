import { request } from "./client";
import {
  ServiceCategory,
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from "../../types/services";

export const getServiceCategories = async (
  businessId: string
): Promise<ServiceCategory[]> => {
  return request<ServiceCategory[]>(`/businesses/${businessId}/categories`);
};

export const createServiceCategory = async (
  businessId: string,
  category: CreateServiceCategoryInput
): Promise<ServiceCategory> => {
  return request<ServiceCategory>(`/businesses/${businessId}/categories`, {
    method: "POST",
    body: JSON.stringify(category),
  });
};

export const updateServiceCategory = async (
  businessId: string,
  categoryId: string,
  category: UpdateServiceCategoryInput
): Promise<ServiceCategory> => {
  return request<ServiceCategory>(
    `/businesses/${businessId}/categories/${categoryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(category),
    }
  );
};

export const deleteServiceCategory = async (
  businessId: string,
  categoryId: string
): Promise<void> => {
  await request<void>(`/businesses/${businessId}/categories/${categoryId}`, {
    method: "DELETE",
  });
};
