import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";
import type { Branch } from "@/types";

interface StickyBranchSelectorProps {
  branches: Branch[];
  selectedBranchId: string | null;
  onClick: () => void;
  pulse?: boolean;
}

export default function StickyBranchSelector({
  branches,
  selectedBranchId,
  onClick,
  pulse = false,
}: StickyBranchSelectorProps) {
  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="sticky top-[60px] z-40 mb-6 flex justify-center py-4 px-4 pointer-events-none">
      <motion.button
        type="button"
        onClick={onClick}
        animate={
          pulse
            ? {
                x: [0, -120, 120, -90, 90, -60, 60, -30, 30, 0],
              }
            : {}
        }
        transition={{ duration: 0.6, ease: "linear" }}
        className={`pointer-events-auto group flex items-center gap-3 rounded-full border border-[var(--border-strong)] py-2.5 pl-3 pr-4 shadow-[var(--shadow-md)] backdrop-blur-md transition-all hover:border-[var(--app-primary)] hover:shadow-[var(--shadow-lg)]
        ${
          selectedBranch
            ? "bg-[var(--surface-1)]/90 text-[var(--text-primary)]"
            : "bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] text-[var(--surface-3)]"
        }
        `}
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            selectedBranch
              ? "bg-[var(--surface-3)] text-[var(--app-primary)] shadow-[var(--shadow-sm)]"
              : "bg-white/20 text-white"
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col items-start text-left">
          {selectedBranch ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                Sede actual
              </span>
              <span className="text-[13px] font-semibold leading-none">
                {selectedBranch.name}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-bold">Selecciona una sede para agendar</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-y-0.5 ${
            selectedBranch ? "text-[var(--text-muted)]" : "text-white/70"
          }`}
        />
      </motion.button>
    </div>
  );
}
