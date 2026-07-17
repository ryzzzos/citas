"use client"

import { type ReactNode, useId, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: "top" | "bottom"
  className?: string
  tooltipClassName?: string
}

export default function Tooltip({
  content,
  children,
  side = "top",
  className,
  tooltipClassName,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  const isTop = side === "top"
  const offsetClass = isTop
    ? "bottom-full mb-2"
    : "top-full mt-2"

  const initialY = isTop ? 6 : -6

  return (
    <div
      className={["relative", className].filter(Boolean).join(" ")}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}

      <AnimatePresence>
        {open ? (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: initialY, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: initialY, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 w-max max-w-[20rem] whitespace-normal break-words rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--text-primary)] shadow-[var(--shadow-md)]",
              offsetClass,
              tooltipClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ maxWidth: "min(20rem, calc(100vw - 1.5rem))" }}
          >
            {content}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
