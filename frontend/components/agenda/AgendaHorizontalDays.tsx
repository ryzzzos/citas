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
      const containerWidth = containerRef.current.clientWidth;
      const btnLeft = selectedBtn.offsetLeft;
      const btnWidth = selectedBtn.clientWidth;

      containerRef.current.scrollTo({
        left: btnLeft - containerWidth / 2 + btnWidth / 2,
        behavior: "smooth",
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
    <div className="relative mb-2">
      <div 
        ref={containerRef}
        className="flex min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden pb-4 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="sticky left-0 z-10 flex min-w-max items-center bg-[var(--dashboard-bg)] pr-2">
          <div className="flex h-[76px] flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50">
            <AppIcon icon={CalendarDays} className="mb-1 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {anchorDate.setZone(timezone).toFormat("MMM, yyyy")}
            </span>
          </div>
          <div className="ml-2 h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {days.map((date) => {
          const isSelected = date.hasSame(anchorDate, "day");
          const isToday = date.hasSame(today, "day");
          const dayName = date.toFormat("ccc");
          const dayNumber = date.toFormat("d");

          let btnClasses =
            "snap-center flex min-w-[72px] h-[76px] flex-col items-center justify-center rounded-[1.25rem] border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 px-2";

          if (isSelected) {
            // Azul Rey Premium para el seleccionado
            btnClasses += " border-blue-400/30 bg-gradient-to-b from-blue-500 to-blue-700 font-bold shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] text-white";
          } else {
            // Inactivo
            btnClasses += " border-zinc-200/80 bg-white shadow-sm hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400";
            if (isToday) {
              btnClasses += " border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400";
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
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? "text-blue-100" : ""}`}>
                {dayName}
              </span>
              <span className={`mt-1 text-xl tracking-tight ${isSelected ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                {dayNumber}
              </span>
              {isToday && !isSelected && (
                <div className="absolute bottom-2 h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
      {/* Efectos de gradiente en los bordes para indicar más scroll */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[var(--dashboard-bg)] to-transparent" />
    </div>
  );
}