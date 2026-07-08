"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AppIcon from "@/components/ui/AppIcon";

interface Option<T> {
  value: T;
  label: string;
}

interface CustomSelectProps<T> {
  id?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  icon?: LucideIcon;
  menuClassName?: string;
}

export default function CustomSelect<T extends string | number>({
  id,
  value,
  options,
  onChange,
  placeholder = "Seleccionar...",
  className = "",
  buttonClassName = "",
  icon,
  menuClassName = "",
}: CustomSelectProps<T>) {
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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-11 flex items-center justify-between rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3.5 text-[14px] text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)] shadow-[var(--shadow-sm)] ${buttonClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && (
            <AppIcon icon={icon} className="text-[var(--text-muted)] shrink-0" size="sm" />
          )}
          <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        </div>
        <ChevronDown 
          className="h-4 w-4 text-[var(--text-muted)] shrink-0 ml-1.5 transition-transform duration-200" 
          style={{ transform: open ? "rotate(180deg)" : "none" }} 
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
            className={`absolute top-[calc(100%+6px)] left-0 z-[850] w-full max-h-56 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] py-1.5 shadow-[var(--shadow-lg)] scrollbar-thin ${menuClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-[var(--surface-2)] focus:outline-none cursor-pointer ${
                    isSelected ? "bg-[var(--app-primary)]/10 font-bold text-[var(--app-primary)]" : "text-[var(--text-primary)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
