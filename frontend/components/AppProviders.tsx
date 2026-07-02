"use client";

import { DiscoverySearchProvider } from "@/components/sucursales/DiscoverySearchContext";

/**
 * Client-side providers wrapper used in the root layout.
 * Wraps children with all application-wide client contexts.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DiscoverySearchProvider>
      {children}
    </DiscoverySearchProvider>
  );
}
