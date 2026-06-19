export interface Staff {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  is_active: boolean;
  branch_id: string;
  service_ids: string[];
}
