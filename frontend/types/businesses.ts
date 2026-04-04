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
