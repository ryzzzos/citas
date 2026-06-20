"use client";

import { useId, ComponentType } from "react";
import { motion } from "framer-motion";

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string; style?: React.CSSProperties }>; // Optional icon component with style
  activeColor?: string; // Optional custom active color (CSS variable or hex)
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  width?: number; // width of each tab in pixels, default 130
  colorizeSelected?: boolean; // Optional prop to enable status color coloring
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  name,
  width = 130,
  colorizeSelected = false,
}: SegmentedControlProps) {
  const controlId = useId();

  return (
    <div
      className="relative flex flex-row items-center p-[2px] bg-[#dadadb] dark:bg-[var(--surface-1)] rounded-[9px] w-max select-none"
      style={{ height: "32px" }}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const inputId = `${controlId}-tab-${index}`;

        return (
          <div
            key={option.value}
            className="relative flex items-center justify-center"
            style={{ width: `${width}px`, height: "28px" }}
          >
            {/* Sliding Indicator (Only rendered on the active tab, Framer Motion slides it between items using layoutId) */}
            {isSelected && (
              <motion.div
                layoutId={`segmented-indicator-${controlId}`}
                className="absolute inset-0 bg-white dark:bg-[var(--surface-3)] rounded-[7px] z-0 pointer-events-none shadow-[0px_3px_8px_rgba(0,0,0,0.12),0px_3px_1px_rgba(0,0,0,0.04)]"
                style={{
                  border: "0.5px solid rgba(0, 0, 0, 0.04)",
                  backgroundColor: option.activeColor && colorizeSelected
                    ? `color-mix(in srgb, ${option.activeColor} 8%, var(--surface-3))`
                    : undefined,
                  borderColor: option.activeColor && colorizeSelected
                    ? `color-mix(in srgb, ${option.activeColor} 30%, rgba(0, 0, 0, 0.04))`
                    : undefined,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            {/* Screen-reader and keyboard focusable native radio input */}
            <input
              type="radio"
              name={name}
              id={inputId}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 outline-none"
            />

            {/* Visual Label */}
            <label
              htmlFor={inputId}
              className="relative z-10 flex w-full h-full items-center justify-center gap-1.5 text-[0.75rem] font-medium cursor-pointer transition-all duration-200"
              style={{
                color: isSelected
                  ? (colorizeSelected && option.activeColor) || "var(--text-primary)"
                  : "var(--text-secondary)",
                opacity: isSelected ? 1 : 0.6,
              }}
            >
              {option.icon && (
                <option.icon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{
                    color: isSelected
                      ? (colorizeSelected && option.activeColor) || "var(--text-primary)"
                      : "var(--text-muted)",
                  }}
                />
              )}
              <span>{option.label}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
