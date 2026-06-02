import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, MapPinned, ArrowRight } from "lucide-react";

import type { Branch } from "@/types";

interface LocationPickerDrawerProps {
  open: boolean;
  branches: Branch[];
  selectedBranchId: string | null;
  onSelect: (branchId: string) => void;
  onClose: () => void;
}

export default function LocationPickerDrawer({
  open,
  branches,
  selectedBranchId,
  onSelect,
  onClose,
}: LocationPickerDrawerProps) {
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[100] bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[100] mx-auto flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[var(--radius-2xl)] border-x border-t border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            aria-hidden={!open}
          >
            {/* Grabber for mobile visual cue */}
            <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[var(--border-strong)]" />

            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)]/90 px-6 pb-4 pt-8 backdrop-blur-md">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                  Elige una sede
                </h3>
                <p className="mt-0.5 text-[13.5px] text-[var(--text-secondary)]">
                  Selecciona el local más cercano para ver su disponibilidad.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] transition-colors hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
                aria-label="Cerrar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border-strong)]">
              {branches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] shadow-[var(--shadow-sm)]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <p className="text-[15px] font-medium text-[var(--text-primary)]">
                    No hay sedes activas
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                    Vuelve a intentarlo más tarde.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {branches.map((branch) => {
                    const isSelected = branch.id === selectedBranchId;

                    return (
                      <button
                        key={branch.id}
                        onClick={() => {
                          onSelect(branch.id);
                          onClose();
                        }}
                        className={`group relative flex flex-col items-start overflow-hidden rounded-[var(--radius-lg)] border p-4 text-left transition-all hover:shadow-[var(--shadow-sm)] ${
                          isSelected
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)]/5"
                            : "border-[var(--border-strong)] bg-[var(--surface-3)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-1)]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute right-0 top-0 rounded-bl-[var(--radius-lg)] bg-[var(--app-primary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--surface-3)]">
                            Actual
                          </div>
                        )}
                        <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)] transition-transform group-hover:scale-105">
                          <MapPinned
                            className={`h-5 w-5 ${
                              isSelected ? "text-[var(--app-primary)]" : "text-[var(--text-secondary)]"
                            }`}
                          />
                        </div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{branch.name}</h4>
                        {branch.address && (
                          <p className="mt-1 line-clamp-2 text-[13px] text-[var(--text-secondary)]">
                            {branch.address}
                          </p>
                        )}
                        <div className="mt-4 flex w-full items-center justify-between">
                          <span
                            className={`text-[12px] font-bold ${
                              isSelected ? "text-[var(--app-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--app-primary)]"
                            } transition-colors`}
                          >
                            Seleccionar
                          </span>
                          <ArrowRight
                            className={`h-4 w-4 -translate-x-2 opacity-0 transition-all ${
                              isSelected
                                ? "translate-x-0 opacity-100 text-[var(--app-primary)]"
                                : "group-hover:translate-x-0 group-hover:opacity-100 text-[var(--app-primary)]"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
