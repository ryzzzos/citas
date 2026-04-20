import type { BusinessMapPoint } from "@/types";

export interface ViewportState {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface DiscoveryFilters {
  city: string;
  category: string;
}

export interface DiscoveryState {
  items: BusinessMapPoint[];
  total: number;
  loading: boolean;
  error: string | null;
}
