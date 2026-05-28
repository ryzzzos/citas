"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function AccordionGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
      {children}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-strong)] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-2)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="px-5 pb-5 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
