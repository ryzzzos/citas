export interface ServiceCategory {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  position: number;
}

export interface CreateServiceCategoryInput {
  name: string;
  description?: string | null;
  position?: number;
}

export interface UpdateServiceCategoryInput {
  name?: string;
  description?: string | null;
  position?: number;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  duration_minutes: number;
  price: string;
  is_active: boolean;
  service_category_id: string | null;
}

export interface ListServicesParams {
  includeInactive?: boolean;
  categoryId?: string;
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes: number;
  price: string;
  is_active?: boolean;
  service_category_id?: string | null;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes?: number;
  price?: string;
  is_active?: boolean;
  service_category_id?: string | null;
}
