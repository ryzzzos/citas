"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarOff, Clock, ShieldAlert, Building2, Coffee } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import CustomSelect from "@/components/ui/CustomSelect";
import SegmentedControl from "@/components/ui/SegmentedControl";
import type { ScheduleBlockInput, Staff } from "@/types";

interface ScheduleBlockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ScheduleBlockInput) => Promise<void>;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialStaffId?: string;
  initialIsAllDay?: boolean;
  staff: Staff[];
  branchId: string;
  branchName?: string;
}

const REASON_PRESETS = [
  { label: "Almuerzo 🥪", value: "Almuerzo" },
  { label: "Vacaciones 🏖️", value: "Vacaciones" },
  { label: "Mantenimiento 🛠️", value: "Mantenimiento" },
  { label: "Permiso personal 👤", value: "Permiso personal" },
  { label: "Cierre por festivo 📅", value: "Cierre por festivo" },
  { label: "Capacitación 📚", value: "Capacitación" },
];

const TIME_OPTIONS = Array.from({ length: 33 }).map((_, i) => {
  const totalMinutes = 6 * 60 + i * 30; // From 06:00 to 22:00 every 30 min
  const hour = Math.floor(totalMinutes / 60);
  const min = totalMinutes % 60;
  const val = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const label = `${displayHour}:${String(min).padStart(2, "0")} ${period}`;
  return { value: val, label };
});

export default function ScheduleBlockDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialStartTime,
  initialEndTime,
  initialStaffId,
  initialIsAllDay = false,
  staff,
  branchId,
  branchName,
}: ScheduleBlockDrawerProps) {
  const [scope, setScope] = useState<"branch" | "staff">(initialStaffId ? "staff" : "branch");
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId || (staff[0]?.id ?? ""));
  const [isAllDay, setIsAllDay] = useState(initialIsAllDay);
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(initialDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(initialStartTime || "13:00");
  const [endTime, setEndTime] = useState(initialEndTime || "14:00");
  const [reason, setReason] = useState("Almuerzo");
  const [submitting, setSubmitting] = useState(false);

  // Sync with prop changes when opening
  useEffect(() => {
    if (isOpen) {
      setIsAllDay(!!initialIsAllDay);
      if (initialDate) {
        setStartDate(initialDate);
        setEndDate(initialDate);
      }
      if (initialStartTime) {
        setStartTime(initialStartTime);
      }
      if (initialEndTime) {
        setEndTime(initialEndTime);
      }
      if (initialStaffId) {
        setScope("staff");
        setSelectedStaffId(initialStaffId);
      } else {
        setScope("branch");
      }
    }
  }, [isOpen, initialDate, initialStartTime, initialEndTime, initialStaffId, initialIsAllDay]);

  const staffOptions = useMemo(() => {
    return staff.map((s) => ({ value: s.id, label: s.name }));
  }, [staff]);

  const handlePresetSelect = (presetVal: string) => {
    setReason(presetVal);
    if (presetVal === "Vacaciones" || presetVal === "Cierre por festivo") {
      setIsAllDay(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    setSubmitting(true);
    try {
      const input: ScheduleBlockInput = {
        branch_id: branchId,
        staff_id: scope === "staff" && selectedStaffId ? selectedStaffId : null,
        start_date: startDate,
        end_date: endDate,
        start_time: isAllDay ? null : `${startTime}:00`,
        end_time: isAllDay ? null : `${endTime}:00`,
        reason: reason.trim() || null,
      };

      await onSubmit(input);
      onClose();
    } catch {
      // Error handled by caller / toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-[var(--surface-3)] shadow-[var(--shadow-lg)] border-l border-[var(--border-strong)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-strong)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-error)] text-white shadow-[var(--shadow-sm)]">
                  <AppIcon icon={CalendarOff} size="sm" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
                    Inhabilitar / Bloquear horario
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Impide nuevas reservas en el periodo seleccionado
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

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Card 1: Alcance del Bloqueo */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <AppIcon icon={Building2} size="xs" />
                  Alcance del Bloqueo
                </label>
                <SegmentedControl
                  name="scope"
                  value={scope}
                  onChange={(val) => setScope(val as "branch" | "staff")}
                  width={190}
                  options={[
                    { value: "branch", label: "Toda la sede" },
                    { value: "staff", label: "Especialista" },
                  ]}
                />

                {scope === "staff" && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Seleccionar especialista
                    </label>
                    <CustomSelect
                      value={selectedStaffId}
                      options={staffOptions}
                      onChange={(val) => setSelectedStaffId(val)}
                      placeholder="Seleccionar especialista..."
                      className="w-full"
                    />
                  </div>
                )}
                {scope === "branch" && branchName && (
                  <p className="text-[11px] text-[var(--text-muted)] italic">
                    Afectará a todos los especialistas de la sede &quot;{branchName}&quot;.
                  </p>
                )}
              </div>

              {/* Card 2: Modalidad y Fechas */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                    <AppIcon icon={Clock} size="xs" />
                    Periodo y Duración
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={isAllDay}
                      onChange={(e) => setIsAllDay(e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border-strong)] text-[var(--app-primary)] focus:ring-[var(--app-primary)]"
                    />
                    Todo el día
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (e.target.value > endDate) setEndDate(e.target.value);
                      }}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                      Fecha de fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--shadow-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
                      required
                    />
                  </div>
                </div>

                {!isAllDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Hora inicio
                      </label>
                      <CustomSelect
                        value={startTime}
                        options={TIME_OPTIONS}
                        onChange={(val) => setStartTime(val)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Hora fin
                      </label>
                      <CustomSelect
                        value={endTime}
                        options={TIME_OPTIONS}
                        onChange={(val) => setEndTime(val)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Motivo / Etiqueta */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 shadow-[var(--shadow-sm)] space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <AppIcon icon={Coffee} size="xs" />
                  Motivo del Bloqueo
                </label>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {REASON_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        reason === preset.value
                          ? "bg-[var(--app-primary)] text-white shadow-[var(--shadow-sm)]"
                          : "bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border-strong)] hover:border-[var(--border-soft)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Descripción o motivo personalizado (ej. Permiso médico)..."
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Info Alert */}
              <div className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-1)] p-3 text-[11px] text-[var(--text-secondary)]">
                <AppIcon icon={ShieldAlert} className="h-4 w-4 text-[var(--color-pending)] shrink-0 mt-0.5" />
                <p>
                  Las citas existentes antes de este bloqueo no se cancelarán automáticamente, pero los clientes ya no podrán agendar nuevas citas en este horario.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-strong)]">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[linear-gradient(90deg,var(--color-error),color-mix(in_srgb,var(--color-error)_80%,black))] px-5 py-2.5 text-xs font-bold text-white shadow-[var(--shadow-md)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <AppIcon icon={CalendarOff} size="xs" />
                  {submitting ? "Bloqueando..." : "Inhabilitar horario"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
