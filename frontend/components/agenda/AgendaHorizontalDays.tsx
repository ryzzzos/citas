"use client";

import { useMemo, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { CalendarDays } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import { motion } from "framer-motion";

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

  // Generamos los días o las semanas del mes actual basado en anchorDate y la vista seleccionada
  const items = useMemo(() => {
    const localAnchor = anchorDate.setZone(timezone);
    const startOfMonth = localAnchor.startOf("month");

    if (view === "week") {
      const weeksList: DateTime[] = [];
      // Generamos 6 semanas hacia el pasado y 18 hacia el futuro respecto a la semana de anchorDate
      const currentWeekStart = localAnchor.startOf("week");

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
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [anchorDate, items]);

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
      <div className="flex min-w-max shrink-0 items-center pr-2 pb-4 pt-1">
        <div className="flex h-[72px] sm:h-[76px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-2.5 sm:p-3 shadow-[var(--shadow-sm)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
          <AppIcon icon={CalendarDays} className="mb-1 text-[var(--text-muted)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ">
            {anchorDate.setZone(timezone).setLocale("es").toFormat("MMM, yyyy")}
          </span>
        </div>
        <div className="ml-2 h-10 w-[1px] bg-[var(--border-strong)]" />
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
                "relative snap-center flex min-w-[250px] sm:min-w-[296px] h-[72px] sm:h-[76px] items-center justify-between rounded-[1.25rem] border transition-all duration-300 ease-out focus:outline-none px-4 sm:px-5 py-2.5 sm:py-3 shrink-0 overflow-hidden z-10";

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
                  layout
                  key={date.toISODate()}
                  type="button"
                  onClick={() => onDateSelect(date)}
                  data-selected={isSelected}
                  className={btnClasses}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[var(--surface-3)]/80" : "text-[var(--text-muted)]"}`}>
                      {isThisWeek && !isSelected ? "Esta semana" : `Semana ${date.weekNumber}`}
                    </span>
                    <span className={`mt-0.5 text-xs sm:text-[14px] font-bold tracking-tight ${isSelected ? "text-[var(--surface-3)]" : "text-[var(--text-primary)]"}`}>
                      {weekStart.toFormat("dd")} al {weekEnd.toFormat("dd")} de {weekEnd.toFormat("MMM")}
                    </span>
                  </div>
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 ${isSelected ? "bg-white/15 text-white" : "bg-[var(--surface-1)] text-[var(--text-secondary)]"}`}>
                    <span className="text-[10px] sm:text-[11px] font-black uppercase">
                      W{date.weekNumber}
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
              "relative snap-center flex min-w-[68px] sm:min-w-[72px] h-[72px] sm:h-[76px] flex-col items-center justify-center rounded-[1.25rem] border transition-all duration-300 ease-out focus:outline-none px-2 shrink-0 overflow-hidden z-10";

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
                layout
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
