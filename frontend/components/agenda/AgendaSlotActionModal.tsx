"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarPlus, CalendarOff, Clock, ChevronRight } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import { DateTime } from "luxon";

interface AgendaSlotActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  onSelectManualBooking: () => void;
  onSelectBlockSchedule: () => void;
}

export default function AgendaSlotActionModal({
  isOpen,
  onClose,
  date,
  startTime,
  endTime,
  isAllDay,
  onSelectManualBooking,
  onSelectBlockSchedule,
}: AgendaSlotActionModalProps) {
  if (!isOpen) return null;

  const formattedDate = DateTime.fromISO(date).setLocale("es").toFormat("cccc, d 'de' MMMM");
  const timeLabel = isAllDay
    ? "Todo el día"
    : startTime && endTime
    ? `${startTime} – ${endTime}`
    : startTime
    ? `Desde las ${startTime}`
    : "Horario seleccionado";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 bg-[var(--text-primary)]/15 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-5 sm:p-6 shadow-[var(--shadow-lg)] z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                ¿Qué deseas realizar?
              </h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-3)] px-2.5 py-1 text-[11px] font-bold capitalize text-[var(--text-secondary)] border border-[var(--border-soft)]">
                  {formattedDate}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface-3)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-primary)] border border-[var(--border-soft)]">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--app-primary)] text-white">
                    <Clock className="h-2.5 w-2.5 text-white" />
                  </div>
                  {timeLabel}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <AppIcon icon={X} size="sm" />
            </button>
          </div>

          {/* Action Options */}
          <div className="space-y-3 mt-4">
            {/* Option 1: Agendar Cita Manual */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectManualBooking();
              }}
              className="group flex w-full items-center justify-between gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3.5 text-left transition-all hover:border-[var(--app-primary)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] text-white shadow-[var(--shadow-sm)]">
                  <CalendarPlus className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--app-primary)] transition-colors">
                    Nueva Cita Manual
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    Registrar cliente presencial o telefónico
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--app-primary)] group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Option 2: Inhabilitar Horario */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectBlockSchedule();
              }}
              className="group flex w-full items-center justify-between gap-3.5 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3.5 text-left transition-all hover:border-[var(--color-error)] hover:shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)]">
                  <CalendarOff className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-error)] transition-colors">
                    Inhabilitar / Bloquear
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    Bloquear este horario o día completo
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--color-error)] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
