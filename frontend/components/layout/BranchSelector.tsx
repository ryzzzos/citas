"use client";

import { useBranchContext } from "@/contexts/BranchContext";
import { ChevronDown, MapPin } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";

export default function BranchSelector() {
  const { branches, activeBranch, setActiveBranch, isLoading, business } = useBranchContext();

  if (isLoading || !business) {
    return (
      <div className="mb-4 px-1">
        <div className="h-16 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-3)]"></div>
      </div>
    );
  }

  return (
    <div className="mb-4 px-1">
      <div className="group relative">
        <select
          value={activeBranch?.id || ""}
          onChange={(e) => setActiveBranch(e.target.value)}
          className="absolute inset-0 w-full appearance-none opacity-0 cursor-pointer z-10"
          aria-label="Seleccionar sucursal"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        
        <div className="relative flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 shadow-[var(--shadow-sm)] transition-all group-hover:border-[var(--app-primary)] group-hover:shadow-[var(--shadow-md)]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-2)] text-[var(--app-primary)]">
              {business.logo_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo_image_url}
                  alt={business.name}
                  className="h-full w-full rounded-[var(--radius-md)] object-cover"
                />
              ) : (
                <AppIcon icon={MapPin} size="sm" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {business.name}
              </p>
              <p className="truncate text-sm font-bold tracking-tight text-[var(--text-primary)]">
                {activeBranch?.name || "Sin sucursales"}
              </p>
            </div>
          </div>
          <AppIcon
            icon={ChevronDown}
            size="sm"
            className="text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]"
          />
        </div>
      </div>
    </div>
  );
}
