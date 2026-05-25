"use client";

import { useMemo, useEffect, useRef } from "react";
import { DateTime } from "luxon";
import { CalendarDays } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";

interface AgendaHorizontalDaysProps {
  anchorDate: DateTime;
  onDateSelect: (date: DateTime) => void;
  timezone: string;
}

export default function AgendaHorizontalDays({
  anchorDate,
  onDateSelect,
  timezone,
}: AgendaHorizontalDaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generamos los días del mes actual basado en anchorDate
  const days = useMemo(() => {
    const localAnchor = anchorDate.setZone(timezone);
    const startOfMonth = localAnchor.startOf("month");
    const daysInMonth = localAnchor.daysInMonth ?? 30;

    return Array.from({ length: daysInMonth }).map((_, i) =>
      startOfMonth.plus({ days: i })
    );
  }, [anchorDate, timezone]);

  const today = DateTime.local().setZone(timezone);

  // Hacemos scroll automático para centrar el día seleccionado
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
  }, [anchorDate, days]);

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
        <div className="flex h-[76px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3 shadow-[var(--shadow-sm)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)]">
          <AppIcon icon={CalendarDays} className="mb-1 text-[var(--text-muted)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] ">
            {anchorDate.setZone(timezone).toFormat("MMM, yyyy")}
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

          {days.map((date) => {
            const isSelected = date.hasSame(anchorDate, "day");
            const isToday = date.hasSame(today, "day");
            const dayName = date.toFormat("ccc");
            const dayNumber = date.toFormat("d");

            let btnClasses =
              "relative snap-center flex min-w-[72px] h-[76px] flex-col items-center justify-center rounded-[1.25rem] border transition-all duration-300 ease-out focus:outline-none px-2";

            if (isSelected) {
              // Azul Rey Premium para el seleccionado
              btnClasses += " border-[var(--app-primary)] bg-[linear-gradient(180deg,var(--app-primary),var(--app-primary-strong))] font-bold shadow-[var(--shadow-md)] text-[var(--surface-3)]";
            } else {
              // Inactivo
              if (isToday) {
                btnClasses += " border-[var(--color-info)] bg-[var(--surface-3)] text-[var(--color-info)] shadow-[var(--shadow-sm)] hover:scale-105 hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95";
              } else {
                btnClasses += " border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-sm)] hover:scale-105 hover:border-[var(--app-primary)] hover:bg-[var(--surface-2)] active:scale-95 text-[var(--text-secondary)]";
              }
            }

            return (
              <button
                key={date.toISODate()}
                type="button"
                onClick={() => onDateSelect(date)}
                data-selected={isSelected}
                className={btnClasses}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? "text-[var(--surface-3)]" : (isToday ? "text-[var(--color-info)]" : "")}`}>
                  {isToday && !isSelected ? "Hoy" : dayName}
                </span>
                <span className={`mt-1 text-xl tracking-tight ${isSelected ? "text-[var(--surface-3)]" : "text-[var(--text-primary)]"}`}>
                  {dayNumber}
                </span>
                {isToday && !isSelected && (
                  <div className="absolute bottom-1.5 h-[5px] w-[5px] rounded-full bg-[var(--color-info)]" />
                )}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute left-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-r from-[var(--surface-2)] to-transparent" />
        {/* Efectos de gradiente en los bordes para indicar más scroll */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 z-10 w-12 bg-gradient-to-l from-[var(--surface-2)] to-transparent" />
      </div>
    </div>
  );
}
