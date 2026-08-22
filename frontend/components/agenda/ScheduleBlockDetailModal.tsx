"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarOff, Clock, User, Building2, Trash2, ShieldCheck } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import type { AgendaScheduleBlock } from "@/lib/agenda/types";
import type { ScheduleBlock } from "@/types";

interface ScheduleBlockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: (ScheduleBlock | AgendaScheduleBlock) | null;
  onDelete: (blockId: string) => Promise<void>;
}

export default function ScheduleBlockDetailModal({
  isOpen,
  onClose,
  block,
  onDelete,
}: ScheduleBlockDetailModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!block) return null;

  const isAllDay = !block.start_time || !block.end_time;
  const timeLabel = isAllDay
    ? "Todo el día"
    : `${block.start_time?.slice(0, 5)} - ${block.end_time?.slice(0, 5)}`;

  const isDateRange = block.start_date !== block.end_date;
  const dateLabel = isDateRange
    ? `Del ${block.start_date} al ${block.end_date}`
    : block.start_date;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(block.id);
      onClose();
    } catch {
      // Error handled by toast
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 sm:p-6 shadow-[var(--shadow-lg)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)]">
                  <AppIcon icon={CalendarOff} size="sm" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
                    {block.reason || "Horario Inhabilitado"}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--color-error)]">
                    Bloqueo de disponibilidad activo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
              >
                <AppIcon icon={X} size="sm" />
              </button>
            </div>

            {/* Details Cards */}
            <div className="my-5 space-y-3">
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3">
                <AppIcon icon={Clock} className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Horario y Fecha
                  </p>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {dateLabel} · <span className="text-[var(--app-primary)]">{timeLabel}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-3">
                <AppIcon icon={block.staff_id ? User : Building2} className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Alcance
                  </p>
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {block.staff_name ? `Especialista: ${block.staff_name}` : "Toda la sede"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-1)] p-2.5 text-[11px] text-[var(--text-secondary)] border border-[var(--border-soft)] mb-5">
              <AppIcon icon={ShieldCheck} className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0" />
              <span>Al liberar este horario, los clientes podrán volver a reservar citas inmediatamente.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-error)] px-4 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-sm)] hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                <AppIcon icon={Trash2} size="xs" />
                {deleting ? "Liberando..." : "Liberar horario"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
