export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  duration_minutes: number;
  price: string;
  is_active: boolean;
}

export interface ListServicesParams {
  includeInactive?: boolean;
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes: number;
  price: string;
  is_active?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  image_url?: string | null;
  duration_minutes?: number;
  price?: string;
  is_active?: boolean;
}
