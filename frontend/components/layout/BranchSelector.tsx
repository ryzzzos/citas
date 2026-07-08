"use client";

import { useState, useRef, useEffect } from "react";
import { useBranchContext } from "@/contexts/BranchContext";
import { ChevronDown, MapPin } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import { AnimatePresence, motion } from "framer-motion";

export default function BranchSelector() {
  const { branches, activeBranch, setActiveBranch, isLoading, business } = useBranchContext();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading || !business) {
    return (
      <div className="mb-4 px-1">
        <div className="h-16 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-3)]"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mb-4 px-1 relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full relative flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 shadow-[var(--shadow-sm)] transition-all hover:border-[var(--app-primary)] hover:shadow-[var(--shadow-md)] cursor-pointer focus:outline-none"
      >
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
          <div className="min-w-0 flex-1 text-left">
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
          className="text-[var(--text-muted)] transition-colors"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-[calc(100%+4px)] left-1 right-1 z-[100] max-h-48 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] py-1.5 shadow-[var(--shadow-lg)] scrollbar-thin"
          >
            {branches.map((branch) => {
              const isSelected = branch.id === activeBranch?.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    setActiveBranch(branch.id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-[var(--surface-2)] focus:outline-none cursor-pointer ${
                    isSelected ? "bg-[var(--app-primary)]/10 font-bold text-[var(--app-primary)]" : "text-[var(--text-primary)]"
                  }`}
                >
                  {branch.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
