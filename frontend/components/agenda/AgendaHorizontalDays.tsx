"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { CalendarDays, ChevronDown } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import { motion, AnimatePresence } from "framer-motion";

function CustomDropdownSelect<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string | number }[];
  onChange: (value: T) => void;
  label: string;
}) {
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
    <div ref={containerRef} className="relative flex-1 flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-1)] transition-all cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 ml-1" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
            className="absolute top-[calc(100%+4px)] left-0 z-[100] w-full max-h-40 overflow-y-auto rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-3)] py-1 shadow-[var(--shadow-md)] scrollbar-thin"
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
                  className={`w-full px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-[var(--surface-2)] focus:outline-none cursor-pointer ${
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

interface AgendaHorizontalDaysProps {
  anchorDate: DateTime;
  onDateSelect: (date: DateTime) => void;
  timezone: string;
  view: "day" | "week" | "month";
}

export default function AgendaHorizontalDays({
  anchorDate,
  onDateSelect,
  timezone,
  view,
}: AgendaHorizontalDaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevView, setPrevView] = useState(view);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const MONTHS = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const currentYear = DateTime.local().year;
  const YEARS = Array.from({ length: 7 }).map((_, i) => currentYear - 2 + i);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthChange = (monthNum: number) => {
    const newDate = anchorDate.set({ month: monthNum });
    onDateSelect(newDate);
  };

  const handleYearChange = (yearNum: number) => {
    const newDate = anchorDate.set({ year: yearNum });
    onDateSelect(newDate);
  };

  const handleGoToToday = () => {
    const now = DateTime.local().setZone(timezone);
    onDateSelect(now);
    setPickerOpen(false);
  };

  const viewChanged = prevView !== view;

  if (viewChanged) {
    setPrevView(view);
  }

  // Generamos los días o las semanas del mes actual basado en anchorDate y la vista seleccionada
  const items = useMemo(() => {
    const localAnchor = anchorDate.setZone(timezone);
    const startOfMonth = localAnchor.startOf("month");

    if (view === "week") {
      const weeksList: DateTime[] = [];
      // Generamos 6 semanas hacia el pasado y 18 hacia el futuro respecto al inicio del mes del anchorDate para mantener la lista estable
      const currentWeekStart = startOfMonth.startOf("week");

      for (let i = -6; i <= 18; i++) {
        weeksList.push(currentWeekStart.plus({ weeks: i }));
      }
      return weeksList;
    } else {
      const daysInMonth = localAnchor.daysInMonth ?? 30;
      return Array.from({ length: daysInMonth }).map((_, i) =>
        startOfMonth.plus({ days: i })
      );
    }
  }, [anchorDate, timezone, view]);

  const today = DateTime.local().setZone(timezone);

  // Hacemos scroll automático para centrar el elemento seleccionado
  useEffect(() => {
    if (!containerRef.current) return;
    const selectedBtn = containerRef.current.querySelector(
      `button[data-selected="true"]`
    ) as HTMLButtonElement | null;

    if (selectedBtn) {
      selectedBtn.scrollIntoView({
        behavior: viewChanged ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [anchorDate, items, viewChanged]);

  // Habilitar scroll horizontal con la rueda vertical del mouse
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Ignorar si ya está presionando Shift (scroll horizontal nativo)
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY, behavior: "auto" });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="mb-2 flex">
      <div ref={pickerRef} className="relative flex min-w-max shrink-0 items-center pr-2 pb-4 pt-1">
        <button
          type="button"
          onClick={() => setPickerOpen((prev) => !prev)}
          className="flex h-[72px] sm:h-[76px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-2.5 sm:p-3 shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)] hover:border-[var(--app-primary)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] cursor-pointer group"
        >
          <AppIcon icon={CalendarDays} className="mb-1 text-[var(--text-muted)] group-hover:text-[var(--app-primary)] transition-colors duration-300" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {anchorDate.setZone(timezone).setLocale("es").toFormat("MMM, yyyy")}
          </span>
        </button>
        <div className="ml-2 h-10 w-[1px] bg-[var(--border-strong)]" />

        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-[calc(100%-8px)] left-0 z-50 w-60 bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] p-3.5 shadow-[var(--shadow-lg)] flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-strong)]/40 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)]">Seleccionar fecha</span>
              </div>
              <div className="flex gap-2">
                <CustomDropdownSelect
                  label="Mes"
                  value={anchorDate.month}
                  options={MONTHS}
                  onChange={handleMonthChange}
                />

                <CustomDropdownSelect
                  label="Año"
                  value={anchorDate.year}
                  options={YEARS.map((y) => ({ value: y, label: y }))}
                  onChange={handleYearChange}
                />
              </div>

              <button
                type="button"
                onClick={handleGoToToday}
                className="w-full py-2 rounded-xl bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))] text-xs font-bold text-white shadow-[var(--shadow-sm)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Fijar día actual
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex-1 min-w-0" style={{ maxWidth: "100%" }}>
        <div 
          ref={containerRef}
          className="flex w-full items-center gap-2 overflow-x-auto overflow-y-hidden pb-4 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >

          {items.map((date) => {
            if (view === "week") {
              const weekStart = date.setLocale("es");
              const weekEnd = date.endOf("week").setLocale("es");
              const isSelected = date.hasSame(anchorDate, "week");
              const isThisWeek = date.hasSame(today, "week");

              let btnClasses =
                "relative snap-center flex min-w-[190px] sm:min-w-[220px] h-[72px] sm:h-[76px] items-center justify-between rounded-[1.25rem] border transition-all duration-300 ease-out focus:outline-none px-4 sm:px-5 py-2.5 sm:py-3 shrink-0 z-10";

              if (isSelected) {
                btnClasses += " border-transparent font-bold shadow-[var(--shadow-md)] text-[var(--surface-3)]";
              } else {
                if (isThisWeek) {
                  btnClasses += " border-[var(--color-info)] bg-[var(--surface-3)] text-[var(--color-info)] shadow-[var(--shadow-sm)] hover:scale-[1.02] hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95";
                } else {
                  btnClasses += " border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] hover:scale-[1.02] hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95 text-[var(--text-secondary)]";
                }
              }


              return (
                <motion.button
                  layout={isSelected}
                  key={date.toISODate()}
                  type="button"
                  onClick={() => onDateSelect(date)}
                  data-selected={isSelected}
                  className={btnClasses}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Left: large week number with accent bar */}
                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="flex flex-col items-center">
                      <span className={`text-[22px] sm:text-[26px] font-black leading-none tracking-tighter ${isSelected ? "text-white" : "text-[var(--text-primary)]"}`}>
                        {date.weekNumber}
                      </span>
                      <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5 ${isSelected ? "text-white/60" : "text-[var(--text-muted)]"}`}>
                        sem
                      </span>
                    </div>
                    {/* Vertical accent divider */}
                    <div className={`h-9 sm:h-10 w-[2px] rounded-full shrink-0 ${isSelected ? "bg-white/25" : "bg-[var(--border-strong)]"}`} />
                  </div>

                  {/* Right: clean date info */}
                  <div className="flex flex-col items-start text-left flex-1 min-w-0 ml-3 sm:ml-4">
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] ${isSelected ? "text-white/60" : "text-[var(--text-muted)]"}`}>
                      {isThisWeek && !isSelected ? "Esta semana" : `${weekEnd.toFormat("MMM")} · ${weekEnd.toFormat("yyyy")}`}
                    </span>
                    <span className={`text-[14px] sm:text-[16px] font-extrabold tracking-tight leading-snug mt-0.5 ${isSelected ? "text-white" : "text-[var(--text-primary)]"}`}>
                      {weekStart.toFormat("dd")} — {weekEnd.toFormat("dd")}
                    </span>
                  </div>

                  {isSelected && (
                    <motion.div
                      layoutId="active-pill-bg"
                      className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {isThisWeek && !isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[5px] w-[5px] rounded-full bg-[var(--color-info)]" />
                  )}
                </motion.button>
              );
            }

            // Botón Diario (view === "day")
            const isSelected = date.hasSame(anchorDate, "day");
            const isToday = date.hasSame(today, "day");
            const dayName = date.setLocale("es").toFormat("ccc");
            const dayNumber = date.toFormat("d");

            let btnClasses =
              "relative snap-center flex min-w-[68px] sm:min-w-[72px] h-[72px] sm:h-[76px] flex-col items-center justify-center rounded-[1.25rem] border transition-all duration-300 ease-out focus:outline-none px-2 shrink-0 z-10";

            if (isSelected) {
              btnClasses += " border-transparent font-bold shadow-[var(--shadow-md)] text-[var(--surface-3)]";
            } else {
              if (isToday) {
                btnClasses += " border-[var(--color-info)] bg-[var(--surface-3)] text-[var(--color-info)] shadow-[var(--shadow-sm)] hover:scale-105 hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95";
              } else {
                btnClasses += " border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] hover:scale-105 hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95 text-[var(--text-secondary)]";
              }
            }

            return (
              <motion.button
                layout={isSelected}
                key={date.toISODate()}
                type="button"
                onClick={() => onDateSelect(date)}
                data-selected={isSelected}
                className={btnClasses}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? "text-[var(--surface-3)]" : (isToday ? "text-[var(--color-info)]" : "")}`}>
                  {isToday && !isSelected ? "Hoy" : dayName}
                </span>
                <span className={`mt-1 text-lg sm:text-xl tracking-tight ${isSelected ? "text-[var(--surface-3)]" : "text-[var(--text-primary)]"}`}>
                  {dayNumber}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="active-pill-bg"
                    className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-r from-[var(--app-primary)] to-[var(--app-primary-strong)] -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1.5 h-[5px] w-[5px] rounded-full bg-[var(--color-info)]" />
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute left-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-r from-[var(--surface-2)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-l from-[var(--surface-2)] to-transparent" />
      </div>
    </div>
  );
}
