import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";

import Button from "@/components/ui/Button";
import type { Schedule, ScheduleInterval, Staff } from "@/types";
import { listSchedules, updateStaffSchedules } from "@/lib/api/schedules";
import { useBranchContext } from "@/contexts/BranchContext";
import TimeRangeSlider from "./TimeRangeSlider";

interface StaffScheduleModalProps {
  open: boolean;
  staff: Staff | null;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, label: "Lunes" },
  { id: 1, label: "Martes" },
  { id: 2, label: "Miércoles" },
  { id: 3, label: "Jueves" },
  { id: 4, label: "Viernes" },
  { id: 5, label: "Sábado" },
  { id: 6, label: "Domingo" },
];

interface DayState {
  enabled: boolean;
  intervals: ScheduleInterval[];
}

export default function StaffScheduleModal({ open, staff, onClose }: StaffScheduleModalProps) {
  const { business } = useBranchContext();
  const [scheduleState, setScheduleState] = useState<Record<number, DayState>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      if (staff && business) {
        loadSchedules(staff.id, business.id);
      }
    } else {
      document.body.style.overflow = "";
      setError(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, staff, business]);

  async function loadSchedules(staffId: string, businessId: string) {
    setLoading(true);
    setError(null);
    try {
      const allSchedules = await listSchedules(businessId);
      const dbSchedules = allSchedules.filter(s => s.staff_id === staffId);

      const newState: Record<number, DayState> = {};
      for (let i = 0; i < 7; i++) {
        newState[i] = { enabled: false, intervals: [] };
      }

      dbSchedules.forEach((sch: Schedule) => {
        if (sch.day_of_week >= 0 && sch.day_of_week <= 6) {
          newState[sch.day_of_week].enabled = true;
          newState[sch.day_of_week].intervals = sch.intervals || [];
        }
      });

      for (let i = 0; i < 7; i++) {
        if (!newState[i].enabled && newState[i].intervals.length === 0) {
          newState[i].intervals = [{ start: "09:00:00", end: "13:00:00" }, { start: "14:00:00", end: "18:00:00" }];
        }
      }

      setScheduleState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los horarios.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!staff || !business) return;
    setSaving(true);
    setError(null);

    const payloadSchedules = [];
    for (let i = 0; i < 7; i++) {
      if (scheduleState[i]?.enabled && scheduleState[i].intervals.length > 0) {
        payloadSchedules.push({
          day_of_week: i,
          intervals: scheduleState[i].intervals,
        });
      }
    }

    try {
      await updateStaffSchedules(business.id, staff.id, { schedules: payloadSchedules });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los horarios.");
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day: number) {
    setScheduleState((prev) => {
      const isCurrentlyEnabled = prev[day].enabled;
      return {
        ...prev,
        [day]: { 
          ...prev[day], 
          enabled: !isCurrentlyEnabled,
          intervals: !isCurrentlyEnabled && prev[day].intervals.length === 0 
            ? [{ start: "09:00:00", end: "13:00:00" }, { start: "14:00:00", end: "18:00:00" }] 
            : prev[day].intervals
        },
      };
    });
  }

  function updateDayIntervals(day: number, newIntervals: ScheduleInterval[]) {
    setScheduleState((prev) => ({
      ...prev,
      [day]: { 
        ...prev[day], 
        intervals: newIntervals,
        enabled: newIntervals.length > 0 
      },
    }));
  }

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
            className="fixed inset-0 z-[80] bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="pointer-events-auto fixed right-4 sm:right-6 top-0 bottom-0 my-auto z-[80] flex w-[90vw] max-w-[700px] h-[95vh] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
          >
            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-6 py-5">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">Horarios de {staff?.name}</h3>
                <p className="text-[13.5px] text-[var(--text-secondary)] mt-0.5">
                  Define los días y horas que trabaja este empleado. Arrastra las barras.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--surface-2)]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--app-primary)]" />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {error && (
                    <div className="rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)] p-3">
                      <p className="text-[13px] font-medium text-[var(--color-error)]">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {DAYS_OF_WEEK.map((day) => {
                      const isActive = scheduleState[day.id]?.enabled || false;
                      const intervals = scheduleState[day.id]?.intervals || [];

                      return (
                        <div key={day.id} className="flex flex-col gap-4 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-5 shadow-[var(--shadow-sm)]">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={isActive}
                                  onChange={() => toggleDay(day.id)}
                                />
                                <div className={`w-10 h-6 rounded-full peer-focus:outline-none transition-colors ${isActive ? 'bg-[var(--app-primary)]' : 'bg-[var(--surface-1)] border border-[var(--border-strong)]'}`}>
                                  <div className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'} shadow-sm`}></div>
                                </div>
                              </label>
                              <span className={`text-[15px] font-semibold ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                {day.label}
                              </span>
                            </div>
                            
                            {isActive && intervals.length === 0 && (
                              <button 
                                onClick={() => updateDayIntervals(day.id, [{start: "09:00:00", end: "13:00:00"}, {start: "14:00:00", end: "18:00:00"}])}
                                className="text-[12px] text-[var(--app-primary)] font-medium hover:underline"
                              >
                                Añadir turno
                              </button>
                            )}
                          </div>

                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-[var(--border-strong)]">
                                  <TimeRangeSlider
                                    intervals={intervals}
                                    onChange={(newIntervals) => updateDayIntervals(day.id, newIntervals)}
                                    minHour={6}
                                    maxHour={22}
                                    stepMinutes={15}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-end border-t border-[var(--border-strong)] bg-[var(--surface-2)] p-4 sm:px-6">
              <Button type="button" onClick={handleSave} disabled={loading || saving} isLoading={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
