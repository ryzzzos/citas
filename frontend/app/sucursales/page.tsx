import { Suspense } from "react";
import SucursalesDiscoveryPage from "@/components/sucursales/SucursalesDiscoveryPage";

export default function SucursalesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-[var(--surface-1)] text-sm text-[var(--text-secondary)]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
        </div>
      }
    >
      <SucursalesDiscoveryPage />
    </Suspense>
  );
}
