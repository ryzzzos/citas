export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}
