import React, { useRef, useState, useEffect, useCallback } from "react";
import { Coffee } from "lucide-react";

export interface TimeInterval {
  start: string; // "HH:MM:00"
  end: string;   // "HH:MM:00"
}

interface TimeRangeSliderProps {
  intervals: TimeInterval[];
  onChange: (newIntervals: TimeInterval[]) => void;
  minHour?: number; // default 6 (06:00)
  maxHour?: number; // default 22 (22:00)
  stepMinutes?: number; // default 15
}

function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

export default function TimeRangeSlider({
  intervals,
  onChange,
  minHour = 6,
  maxHour = 22,
  stepMinutes = 15,
}: TimeRangeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSliderMinutes = (maxHour - minHour) * 60;
  const hoursRange = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);

  // Since break is mandatory, we extract shift and break from intervals.
  // If only 1 interval is passed (legacy/default), we calculate a default break.
  let shiftStartRaw = "09:00:00";
  let shiftEndRaw = "18:00:00";
  let breakStartRaw = "13:00:00";
  let breakEndRaw = "14:00:00";

  if (intervals.length === 1) {
    shiftStartRaw = intervals[0].start;
    shiftEndRaw = intervals[0].end;
    const startMins = timeStringToMinutes(shiftStartRaw);
    const endMins = timeStringToMinutes(shiftEndRaw);
    const mid = startMins + Math.floor((endMins - startMins) / 2);
    // Ensure break is aligned to stepMinutes
    const alignedMid = Math.round(mid / stepMinutes) * stepMinutes;
    breakStartRaw = minutesToTimeString(Math.max(startMins + stepMinutes, alignedMid - 30));
    breakEndRaw = minutesToTimeString(Math.min(endMins - stepMinutes, alignedMid + 30));
    
    // Auto-correct to backend format immediately on first render if needed
    // but better to avoid render cycle loops; parent will save the current visible state.
  } else if (intervals.length >= 2) {
    shiftStartRaw = intervals[0].start;
    breakStartRaw = intervals[0].end;
    breakEndRaw = intervals[1].start;
    shiftEndRaw = intervals[intervals.length - 1].end;
  }

  const shiftStartMins = Math.max(0, timeStringToMinutes(shiftStartRaw) - minHour * 60);
  const breakStartMins = Math.max(0, timeStringToMinutes(breakStartRaw) - minHour * 60);
  const breakEndMins = Math.min(totalSliderMinutes, timeStringToMinutes(breakEndRaw) - minHour * 60);
  const shiftEndMins = Math.min(totalSliderMinutes, timeStringToMinutes(shiftEndRaw) - minHour * 60);

  type DragEdge = "shift_start" | "shift_end" | "break_start" | "break_end" | "break_move";
  const [draggingEdge, setDraggingEdge] = useState<DragEdge | null>(null);
  const [startX, setStartX] = useState(0);
  
  // Guardamos el estado inicial exacto al comenzar el drag
  const [dragState, setDragState] = useState({ ss: 0, bs: 0, be: 0, se: 0 });

  const updateIntervals = useCallback((ss: number, bs: number, be: number, se: number) => {
    onChange([
      { start: minutesToTimeString(ss + minHour * 60), end: minutesToTimeString(bs + minHour * 60) },
      { start: minutesToTimeString(be + minHour * 60), end: minutesToTimeString(se + minHour * 60) }
    ]);
  }, [minHour, onChange]);

  const handlePointerDown = (e: React.PointerEvent, edge: DragEdge) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setDraggingEdge(edge);
    setStartX(e.clientX);
    setDragState({ ss: shiftStartMins, bs: breakStartMins, be: breakEndMins, se: shiftEndMins });
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!draggingEdge || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const pxPerMinute = rect.width / totalSliderMinutes;
    
    const deltaX = e.clientX - startX;
    const deltaMinutes = Math.round((deltaX / pxPerMinute) / stepMinutes) * stepMinutes;

    let { ss, bs, be, se } = dragState;

    if (draggingEdge === "shift_start") {
      ss = Math.min(ss + deltaMinutes, bs - stepMinutes);
      ss = Math.max(0, ss);
    } else if (draggingEdge === "shift_end") {
      se = Math.max(se + deltaMinutes, be + stepMinutes);
      se = Math.min(totalSliderMinutes, se);
    } else if (draggingEdge === "break_start") {
      bs = Math.min(bs + deltaMinutes, be - stepMinutes);
      bs = Math.max(ss + stepMinutes, bs);
    } else if (draggingEdge === "break_end") {
      be = Math.max(be + deltaMinutes, bs + stepMinutes);
      be = Math.min(se - stepMinutes, be);
    } else if (draggingEdge === "break_move") {
      const duration = be - bs;
      bs += deltaMinutes;
      be += deltaMinutes;
      
      // Boundaries
      if (bs <= ss) {
        bs = ss + stepMinutes;
        be = bs + duration;
      }
      if (be >= se) {
        be = se - stepMinutes;
        bs = be - duration;
      }
    }

    updateIntervals(ss, bs, be, se);

  }, [draggingEdge, startX, dragState, totalSliderMinutes, stepMinutes, updateIntervals]);

  const handlePointerUp = useCallback(() => {
    setDraggingEdge(null);
  }, []);

  useEffect(() => {
    if (draggingEdge) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingEdge, handlePointerMove, handlePointerUp]);

  // Calculations for positioning
  const shiftLeft = (shiftStartMins / totalSliderMinutes) * 100;
  const shiftWidth = ((shiftEndMins - shiftStartMins) / totalSliderMinutes) * 100;

  // Break is positioned *relative to the container*, but we will render it inside a relative container or absolute on the same level.
  // Let's render everything absolutely on the ruler container.
  const breakLeft = (breakStartMins / totalSliderMinutes) * 100;
  const breakWidth = ((breakEndMins - breakStartMins) / totalSliderMinutes) * 100;

  return (
    <div className="w-full flex flex-col gap-6 select-none">
      {/* Timeline Ruler */}
      <div className="relative h-6 w-full px-2" ref={containerRef}>
        {/* Línea de base */}
        <div className="absolute top-1/2 left-0 w-full h-[6px] -translate-y-1/2 bg-[var(--surface-3)] rounded-full border border-[var(--border-strong)]" />

        {/* Marcas de horas */}
        {hoursRange.map((hour, i) => {
          const isEven = hour % 2 === 0;
          if (!isEven) return null;

          const leftP = (i / (maxHour - minHour)) * 100;
          return (
            <div
              key={hour}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${leftP}%` }}
            >
              <div className="h-2 w-px bg-[var(--border-strong)]" />
              <span className="text-[10px] font-medium text-[var(--text-muted)] mt-1.5 absolute top-2">
                {hour}:00
              </span>
            </div>
          );
        })}

        {/* CONTENEDOR DEL TURNO COMPLETO (Area Única) */}
        <div
          className={`absolute top-1/2 h-9 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[var(--app-primary)] to-[var(--color-info)] transition-shadow overflow-hidden ${
            draggingEdge ? "shadow-[0_4px_16px_rgba(0,122,255,0.4)] z-10" : "hover:shadow-[0_2px_8px_rgba(0,122,255,0.3)] shadow-sm"
          }`}
          style={{ left: `${shiftLeft}%`, width: `${shiftWidth}%`, minWidth: "32px" }}
        >
        </div>

        {/* Tiradores del Turno (Izquierda y Derecha) */}
        <div
          className="absolute top-1/2 h-9 -translate-y-1/2 z-20 pointer-events-none"
          style={{ left: `${shiftLeft}%`, width: `${shiftWidth}%` }}
        >
           <div
            className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, "shift_start")}
          >
            <div className="h-5 w-1.5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] opacity-90 group-hover:opacity-100 group-hover:scale-y-125 transition-all" />
          </div>
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, "shift_end")}
          >
            <div className="h-5 w-1.5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] opacity-90 group-hover:opacity-100 group-hover:scale-y-125 transition-all" />
          </div>
        </div>

        {/* SEGMENTO DE DESCANSO INCRUSTADO */}
        <div
          className="absolute top-1/2 h-9 -translate-y-1/2 bg-[var(--color-pending)]/90 backdrop-blur-md border-x border-white/20 cursor-move z-10 group/break shadow-inner transition-transform"
          style={{ left: `${breakLeft}%`, width: `${breakWidth}%`, minWidth: "16px" }}
          onPointerDown={(e) => handlePointerDown(e, "break_move")}
          title="Arrastra para mover el descanso"
        >
           {/* Patrón de líneas diagonales premium */}
           <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, white 4px, white 8px)' }}></div>
           
           {/* Ícono de descanso sutil en el centro */}
           <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover/break:opacity-100 group-hover/break:scale-110 transition-all">
              <Coffee className="h-4 w-4 text-white drop-shadow-md" />
           </div>

           {/* Tirador Descanso Inicio */}
           <div
            className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, "break_start")}
          >
            <div className="h-3 w-1 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-y-125 shadow-sm transition-all" />
          </div>
          
          {/* Tirador Descanso Fin */}
          <div
            className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center group pointer-events-auto"
            onPointerDown={(e) => handlePointerDown(e, "break_end")}
          >
            <div className="h-3 w-1 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-y-125 shadow-sm transition-all" />
          </div>
        </div>

      </div>

      {/* Detalles textuales abajo de la línea */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center">
        {/* Turno Base */}
        <div className="flex-1 flex items-center justify-between text-[13px] bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-xl py-3 px-4 w-full shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[var(--color-info)] shadow-sm"></div>
            <span className="font-semibold text-[var(--text-primary)]">Horario Laboral</span>
          </div>
          <span className="text-[var(--text-primary)] font-bold tracking-tight">
            {shiftStartRaw.substring(0, 5)} - {shiftEndRaw.substring(0, 5)}
          </span>
        </div>

        {/* Descanso Obligatorio */}
        <div className="flex-1 flex items-center justify-between text-[13px] bg-[var(--color-pending)]/10 border border-[var(--color-pending)]/20 rounded-xl py-3 px-4 w-full relative overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-pending)]"></div>
          <div className="flex items-center gap-2 text-[var(--color-pending)] ml-1">
            <Coffee className="h-4 w-4" />
            <span className="font-semibold">Descanso</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="font-bold tracking-tight text-[var(--color-pending)] drop-shadow-sm">
               {breakStartRaw.substring(0, 5)} - {breakEndRaw.substring(0, 5)}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}
