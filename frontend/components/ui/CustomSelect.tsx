"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AppIcon from "@/components/ui/AppIcon";

export interface Option<T> {
  value: T;
  label: string;
}

export interface CustomSelectProps<T> {
  id?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  icon?: LucideIcon;
  menuClassName?: string;
  variant?: "solid" | "glass" | "ghost";
  align?: "left" | "right";
  size?: "sm" | "md";
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
  variant = "solid",
  align = "left",
  size = "md",
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

  // Variant Styles
  let buttonVariantStyles = "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]";
  let menuVariantStyles = "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]";

  if (variant === "glass") {
    buttonVariantStyles = "bg-[var(--surface-glass)] backdrop-blur-md border border-[var(--glass-border)] shadow-[var(--glass-shadow)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70";
    menuVariantStyles = "bg-[var(--surface-glass)]/95 backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)]";
  } else if (variant === "ghost") {
    buttonVariantStyles = "bg-transparent border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/70";
    menuVariantStyles = "bg-[var(--surface-3)] border border-[var(--border-strong)] shadow-[var(--shadow-lg)]";
  }

  // Size Styles
  const isSm = size === "sm";
  const sizeStyles = isSm
    ? "h-8 px-2.5 text-xs rounded-[var(--radius-sm)]"
    : "h-9 sm:h-10 px-3 text-xs sm:text-[13px] rounded-[var(--radius-sm)]";

  // Alignment
  const alignStyles = align === "right" ? "right-0 left-auto" : "left-0";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} id={id}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 font-medium transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)] ${sizeStyles} ${buttonVariantStyles} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <AppIcon icon={icon} className="text-[var(--text-muted)] shrink-0" size="sm" />
          )}
          <span className="truncate font-semibold">{selectedOption?.label ?? placeholder}</span>
        </div>
        <ChevronDown 
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${isSm ? "h-3 w-3" : "h-3.5 w-3.5"}`} 
          style={{ transform: open ? "rotate(180deg)" : "none" }} 
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.95, filter: "blur(6px)" }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-[calc(100%+6px)] z-[850] min-w-[155px] max-h-60 overflow-y-auto rounded-[var(--radius-lg)] p-1.5 hide-scrollbar ${alignStyles} ${menuVariantStyles} ${menuClassName}`}
          >
            <div className="space-y-0.5">
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
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs font-semibold rounded-full transition-all focus:outline-none cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-[var(--surface-2)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] border border-[var(--border-soft)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]/60 border border-transparent"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-[var(--text-primary)] stroke-[2.5]" />
                      )}
                    </div>
                    <span className="flex-1 truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
