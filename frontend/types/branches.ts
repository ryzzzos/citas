export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  whatsapp_phone: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: string;
  geocoding_error: string | null;
  geocoded_at: string | null;
  created_at: string;
}

export interface CreateBranchInput {
  name: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp_phone?: string | null;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  whatsapp_phone?: string | null;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}
