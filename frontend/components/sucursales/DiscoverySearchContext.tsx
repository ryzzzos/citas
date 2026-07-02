"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { BusinessMapPoint } from "@/types";
import type { DiscoveryFilters } from "@/components/sucursales/types";

/* ── Public data shape ──────────────────────────────────────── */

export interface DiscoverySearchData {
  items: BusinessMapPoint[];
  filters: DiscoveryFilters;
  onFiltersChange: (filters: DiscoveryFilters) => void;
  onSelectBusiness: (businessId: string) => void;
  loading: boolean;
}

/* ── Context value ──────────────────────────────────────────── */

interface DiscoverySearchContextValue {
  /** `null` when no discovery page is mounted (e.g. on `/`, `/auth`, etc.) */
  data: DiscoverySearchData | null;
  /** Called by SucursalesDiscoveryPage to push its state into the context */
  register: (data: DiscoverySearchData) => void;
  /** Called on unmount to clear */
  unregister: () => void;
}

const DiscoverySearchContext = createContext<DiscoverySearchContextValue>({
  data: null,
  register: () => {},
  unregister: () => {},
});

/* ── Provider (lives in root layout) ────────────────────────── */

export function DiscoverySearchProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DiscoverySearchData | null>(null);

  const register = useCallback((nextData: DiscoverySearchData) => {
    setData(nextData);
  }, []);

  const unregister = useCallback(() => {
    setData(null);
  }, []);

  return (
    <DiscoverySearchContext value={{ data, register, unregister }}>
      {children}
    </DiscoverySearchContext>
  );
}

/* ── Consumer hook (used by NavbarSearchCombobox) ───────────── */

export function useDiscoverySearch(): DiscoverySearchData | null {
  return useContext(DiscoverySearchContext).data;
}

/* ── Registration hook (used by SucursalesDiscoveryPage) ────── */

export function useDiscoverySearchRegistration() {
  const { register, unregister } = useContext(DiscoverySearchContext);
  return { register, unregister };
}
