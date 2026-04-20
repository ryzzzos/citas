export type GeocodingStatus = "pending" | "manual" | "success" | "failed";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string;
  phone: string;
  whatsapp_phone: string | null;
  email: string;
  public_bio: string | null;
  cover_image_url: string | null;
  logo_image_url: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  geocoding_status: GeocodingStatus;
  geocoding_error: string | null;
  geocoded_at: string | null;
  created_at: string;
}

export interface BusinessSlugAvailability {
  slug: string;
  available: boolean;
}

export interface BusinessImageUpload {
  image_url: string;
}

export interface UpdateBusinessInput {
  name?: string;
  description?: string | null;
  slug?: string | null;
  category?: string;
  phone?: string;
  whatsapp_phone?: string | null;
  email?: string;
  public_bio?: string | null;
  cover_image_url?: string | null;
  logo_image_url?: string | null;
  address?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BusinessMapPoint {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  public_bio: string | null;
  logo_image_url: string | null;
  cover_image_url: string | null;
  geocoding_status: GeocodingStatus;
}

export interface BusinessMapViewport {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BusinessMapClustering {
  enabled: boolean;
  strategy: "frontend" | "server";
  recommended_radius: number;
}

export interface BusinessMapResponse {
  items: BusinessMapPoint[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
  viewport: BusinessMapViewport;
  clustering: BusinessMapClustering;
}
