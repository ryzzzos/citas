/* eslint-disable react-hooks/refs */
import { useEffect, useState, useRef, useCallback } from "react";
import { DateTime } from "luxon";
import { Clock, User, Check, Phone, Mail, MessageSquare, ChevronRight, CheckCircle2, Wallet, Banknote, CreditCard, ArrowLeftRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { AgendaBooking, AgendaDayColumn } from "@/lib/agenda/types";
import type { PaymentMethod } from "@/lib/api/bookings";
import type { Staff } from "@/types";
import SegmentedControl from "@/components/ui/SegmentedControl";
import BookingTimeline from "./BookingTimeline";

interface AgendaTimelineProps {
  columns: AgendaDayColumn[];
  bookingsByDay: Record<string, AgendaBooking[]>;
  timelineSlots: string[];
  staff: Staff[];
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string, bookingDate: string, startTime: string, staffId?: string) => void;
  onStatusUpdate?: (
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ) => void;
  onPaymentRegister?: (bookingId: string, method: PaymentMethod) => void;
  initialBookingId?: string | null;
}

const PX_PER_MINUTE = 2.0;

interface DragState {
booking: AgendaBooking;
initialX: number;
initialY: number;
currentX: number;
currentY: number;
top: number;
height: number;
isDragging: boolean;
targetDate: string;
targetTime: string;
}

interface PositionedBooking {
booking: AgendaBooking;
lane: number;
laneCount: number;
top: number;
height: number;
}

function toMinutes(booking: AgendaBooking): { start: number; end: number } {
const start = booking.startAt.hour * 60 + booking.startAt.minute;
const end = booking.endAt.hour * 60 + booking.endAt.minute;
return { start, end: Math.max(end, start + 15) };
}

function layoutDayBookings(bookings: AgendaBooking[]): PositionedBooking[] {
const sorted = [...bookings].sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
const laneById = new Map<string, number>();
const active: Array<{ bookingId: string; end: number; lane: number }> = [];

for (const booking of sorted) {
const { start, end } = toMinutes(booking);

for (let index = active.length - 1; index >= 0; index -= 1) {
if (active[index].end <= start) {
active.splice(index, 1);
}
}

const usedLanes = new Set(active.map((item) => item.lane));
let lane = 0;
while (usedLanes.has(lane)) {
lane += 1;
}

laneById.set(booking.id, lane);
active.push({ bookingId: booking.id, end, lane });
}

return sorted.map((booking) => {
const bTime = toMinutes(booking);
const lane = laneById.get(booking.id) ?? 0;

let laneCount = 1;
for (const candidate of sorted) {
const other = toMinutes(candidate);
const overlaps = bTime.start < other.end && other.start < bTime.end;
if (!overlaps) continue;

const candidateLane = laneById.get(candidate.id) ?? 0;
laneCount = Math.max(laneCount, candidateLane + 1);
}

return {
booking,
lane,
laneCount,
top: (bTime.start - 6 * 60) * PX_PER_MINUTE,                                                       
height: Math.max(30, (bTime.end - bTime.start) * PX_PER_MINUTE),
};
});
}

/* ── Status → CSS variable name mapping ────────────────────────── */
const STATUS_VAR: Record<string, string> = {
pending: "--color-pending",
confirmed: "--color-info",
completed: "--color-success",
cancelled: "--color-error",
};

const STATUS_LABEL: Record<string, string> = {
pending: "Pendiente",
confirmed: "Confirmada",
completed: "Completada",
cancelled: "Cancelada",
};

function renderEventBlock(
item: PositionedBooking,
onSelect: (booking: AgendaBooking) => void,
isWeekly = false,
activeDrag: DragState | null = null,
onPointerDown?: (
e: React.PointerEvent<HTMLElement>,
item: PositionedBooking,
originalDate: string
) => void
) {
const widthPercent = 100 / item.laneCount;
const leftPercent = item.lane * widthPercent;
const booking = item.booking;
const statusVar = STATUS_VAR[booking.status] ?? "--color-pending";

/* Density tiers */
const isCompact = item.height < 45;
const isMedium = item.height >= 45 && item.height < 90;
const isLarge = item.height >= 90;

const isThisDragging = activeDrag && activeDrag.booking.id === booking.id && activeDrag.isDragging;

return (
<article
key={booking.id}
onPointerDown={onPointerDown ? (e) => onPointerDown(e, item, booking.booking_date) : undefined}
onClick={onPointerDown ? undefined : () => onSelect(booking)}
className={`absolute group/card overflow-hidden select-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
onPointerDown ? (isThisDragging ? "z-50 duration-0 cursor-grabbing" : "cursor-grab hover:z-20") : "cursor-pointer hover:z-20"
}`}
style={{
top: item.top,
height: item.height,
left: `calc(${leftPercent}% + 3px)`,
width: `calc(${widthPercent}% - 6px)`,
opacity: isThisDragging ? 0.65 : 1,
transform: isThisDragging
? `translate(${activeDrag.currentX - activeDrag.initialX}px, ${activeDrag.currentY - activeDrag.initialY}px) scale(1.025)`
: undefined,
boxShadow: isThisDragging ? "var(--shadow-lg)" : undefined,
touchAction: onPointerDown ? "none" : undefined,
}}
role="article"
aria-label={`${booking.serviceName} ${booking.startAt.toFormat("HH:mm")} a ${booking.endAt.toFormat("HH:mm")}`}
>
{/* ── Card shell with status-tinted background ── */}
<div
className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xs)] border transition-all duration-300 bg-[color-mix(in_srgb,var(--status-color)_6%,var(--surface-3))] hover:bg-[color-mix(in_srgb,var(--status-color)_15%,var(--surface-3))] border-[color-mix(in_srgb,var(--status-color)_25%,var(--border-soft))] hover:border-[color-mix(in_srgb,var(--status-color)_65%,var(--border-strong))]"
style={{
  '--status-color': `var(${statusVar})`,
  boxShadow: `0 1px 3px -1px color-mix(in srgb, var(${statusVar}) 15%, transparent), 0 1px 2px -1px rgba(0,0,0,0.04)`,
} as React.CSSProperties}
>
{/* ── Top accent gradient line ── */}
<div
className="absolute inset-x-0 top-0 h-[2.5px] opacity-90"
style={{
background: `linear-gradient(90deg, var(${statusVar}), color-mix(in srgb, var(${statusVar}) 40%, var(--surface-3)))`,
}}
aria-hidden="true"
/>

{/* ── Hover glow effect ── */}
<div
className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
style={{
boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(${statusVar}) 20%, transparent), 0 8px 24px -6px color-mix(in srgb, var(${statusVar}) 20%, transparent)`,
}}
aria-hidden="true"
/>

{/* ═══════ COMPACT ═══════ */}
{isCompact && (
<div className="flex h-full items-center gap-1.5 px-2.5 pt-[3px]">
<p className="min-w-0 flex-1 truncate text-[10.5px] font-semibold leading-none tracking-tight text-[var(--text-primary)]">
{isWeekly ? booking.startAt.toFormat("HH:mm") : booking.serviceName}
</p>
{!isWeekly && (
<span
className="shrink-0 text-[9px] font-bold tabular-nums"
style={{ color: `var(${statusVar})` }}
>
{booking.startAt.toFormat("HH:mm")}
</span>
)}
</div>
)}

{/* ═══════ MEDIUM ═══════ */}
{isMedium && (
<div className={`flex h-full flex-col justify-between ${isWeekly ? "px-2 pb-1.5 pt-[5px]" : "px-3 pb-2 pt-[7px]"}`}>
{/* Top row: time (weekly) or service + time (daily) */}
<div className="flex items-start justify-between gap-1">
<p className={`min-w-0 flex-1 truncate font-bold leading-tight tracking-tight text-[var(--text-primary)] ${isWeekly ? "text-[10px]" : "text-[12px]"}`}>
{isWeekly ? booking.startAt.toFormat("HH:mm") : booking.serviceName}
</p>
{!isWeekly && (
<span className="shrink-0 rounded-md px-1.5 py-0.5 text-[8.5px] font-bold tabular-nums"
style={{
backgroundColor: `color-mix(in srgb, var(${statusVar}) 10%, var(--surface-3))`,
color: `var(${statusVar})`,
}}
>
{booking.startAt.toFormat("HH:mm")}
</span>
)}
</div>

{/* Bottom row */}
<div className="flex items-center gap-1 mt-auto">
{isWeekly ? (
<p className="min-w-0 flex-1 truncate text-[9px] font-medium text-[var(--text-secondary)]">
{booking.serviceName}
</p>
) : (
<>
{/* Mini avatar */}
<div
className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7.5px] font-bold uppercase"
style={{
backgroundColor: `color-mix(in srgb, var(${statusVar}) 14%, var(--surface-2))`,
color: `var(${statusVar})`,
}}
>
{(booking.customer_name ?? "C").charAt(0)}
</div>
<span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--text-secondary)]">
{booking.customer_name ?? "Cliente"}
</span>
<span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[var(--text-secondary)]">
{booking.customer_name ?? "Cliente"}
</span>
<span className="hidden sm:inline shrink-0 truncate text-[9px] font-medium text-[var(--text-muted)] max-w-[35%]">
{booking.staffName}
</span>
</>
)}
</div>
</div>
)}

{/* ═══════ LARGE ═══════ */}
{isLarge && (
<div className={`flex h-full flex-col ${isWeekly ? "px-2 pb-2 pt-[5px]" : "px-3.5 pb-3.5 pt-[10px]"}`}>
{/* Row 1: Time badge + Status pill */}
<div className="flex items-center justify-between gap-1">
{isWeekly ? (
<span
className="text-[9px] font-bold tabular-nums"
style={{ color: `var(${statusVar})` }}
>
{booking.startAt.toFormat("HH:mm")}
</span>
) : (
<div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
<Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
<span>{booking.startAt.toFormat("HH:mm")} – {booking.endAt.toFormat("HH:mm")}</span>
</div>
)}

<span
className={`rounded-full font-bold uppercase tracking-wider ${isWeekly ? "px-1 py-[1px] text-[7px]" : "px-1.5 py-[2px] text-[7.5px]"}`}
style={{
backgroundColor: `color-mix(in srgb, var(${statusVar}) 12%, var(--surface-2))`,
color: `var(${statusVar})`,
}}
>
{STATUS_LABEL[booking.status] ?? "Pendiente"}
</span>
</div>

{/* Row 2: Service name (hero text) */}
<h4 className={`truncate font-extrabold tracking-tight text-[var(--text-primary)] leading-snug ${isWeekly ? "mt-1 text-[10px]" : "mt-2.5 text-[14px]"}`}>
{booking.serviceName}
</h4>

{/* Row 3 & 4 (Unified layout for daily view without borders, clean spacing) */}
{isWeekly ? (
<div className="flex items-center gap-1.5 mt-1">
<div className="min-w-0 flex-1">
<p className="truncate font-semibold text-[var(--text-secondary)] leading-tight text-[9px]">
{booking.customer_name ?? "Cliente sin nombre"}
</p>
</div>
</div>
) : (
<div className="mt-auto flex flex-col gap-1.5">
{/* Customer row */}
<div className="flex items-center gap-2">
<div
className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-[8.5px] font-bold uppercase ring-[1px]"
style={{
backgroundColor: `color-mix(in srgb, var(${statusVar}) 12%, var(--surface-1))`,
color: `var(${statusVar})`,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
...({ "--tw-ring-color": `color-mix(in srgb, var(${statusVar}) 25%, transparent)` } as any),
}}
>
{(booking.customer_name ?? "C").charAt(0)}
</div>
<span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[var(--text-secondary)]">
{booking.customer_name ?? "Cliente sin nombre"}
</span>
</div>

{/* Staff row */}
<div className="flex items-center gap-1.5 pl-0.5">
<User className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
<span className="truncate text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
{booking.staffName}
</span>
</div>
</div>
)}
</div>
)}
</div>
</article>
);
}

function CurrentTimeLine() {
const [now, setNow] = useState(DateTime.local());

useEffect(() => {
const interval = setInterval(() => setNow(DateTime.local()), 60000);
return () => clearInterval(interval);
}, []);

const minutes = now.hour * 60 + now.minute;
if (minutes < 6 * 60 || minutes > 22 * 60) return null;
const top = (minutes - 6 * 60) * PX_PER_MINUTE;

return (
<div
className="pointer-events-none absolute inset-x-0 z-30 flex items-center"
style={{ top }}
>
<div className="absolute left-0 h-[7px] w-[7px] -translate-x-[3px] rounded-full bg-[var(--app-primary)] shadow-[0_0_6px_var(--app-primary)]" />
<div className="h-[2px] w-full bg-[var(--app-primary)] opacity-80 shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />
</div>
);
}

export default function AgendaTimeline({
  columns,
  bookingsByDay,
  timelineSlots,
  staff,
  onConfirm,
  onCancel,
  onReschedule,
  onStatusUpdate,
onPaymentRegister,
initialBookingId,
}: AgendaTimelineProps) {
const [selectedBooking, setSelectedBooking] = useState<AgendaBooking | null>(null);
const [drawerStatus, setDrawerStatus] = useState<AgendaBooking["status"] | null>(null);
const [statusBeforeCancel, setStatusBeforeCancel] = useState<AgendaBooking["status"] | null>(null);
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
const [copiedText, setCopiedText] = useState<string | null>(null);
const scrollContainerRef = useRef<HTMLDivElement>(null);
const handleSelectBooking = useCallback((booking: AgendaBooking) => {
setSelectedBooking(booking);
setDrawerStatus(booking.status);
setStatusBeforeCancel(null);
setSelectedPaymentMethod(null);
setCopiedText(null);
}, []);

const [activeDrag, setActiveDrag] = useState<DragState | null>(null);
const dragStateRef = useRef<DragState | null>(null);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const cleanupDragRef = useRef<(() => void) | null>(null);

// Safety cleanup when component unmounts mid-drag
useEffect(() => {
  return () => {
    cleanupDragRef.current?.();
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []);

const [rescheduleConfirm, setRescheduleConfirm] = useState<{
booking: AgendaBooking;
targetDate: string;
targetTime: string;
} | null>(null);

  const handlePointerDown = useCallback((
    e: React.PointerEvent<HTMLElement>,
    item: PositionedBooking,
    originalDate: string
  ) => {
    console.log("handlePointerDown: started for", item.booking.id, "pointerType:", e.pointerType);

    // Non-draggable statuses → open detail drawer immediately
    if (item.booking.status !== "pending" && item.booking.status !== "confirmed") {
      console.log("handlePointerDown: status not pending/confirmed, opening drawer immediately");
      handleSelectBooking(item.booking);
      return;
    }

    // Prevent synthetic click + touch-scroll during drag interaction
    e.preventDefault();

    const isTouch = e.pointerType === "touch";

    const initialDrag: DragState = {
      booking: item.booking,
      initialX: e.clientX,
      initialY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      top: item.top,
      height: item.height,
      isDragging: false,
      targetDate: originalDate,
      targetTime: item.booking.startAt.toFormat("HH:mm"),
    };
    dragStateRef.current = initialDrag;

    // ── Global listeners are attached immediately so we reliably intercept
    // pointermove/pointerup even across re-renders caused by setActiveDrag.
    // This avoids the setPointerCapture race condition on React elements.
    const onMove = (ev: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      if (!drag.isDragging) {
        const dx = ev.clientX - drag.initialX;
        const dy = ev.clientY - drag.initialY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (isTouch) {
          // Touch: If pointer moves noticeably before long-press fires, cancel intent (assume scrolling)
          if (distance > 8) {
            console.log("onMove: touch drag cancelled due to distance:", distance);
            if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
            dragStateRef.current = null;
            setActiveDrag(null);
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            cleanupDragRef.current = null;
          }
          return;
        } else {
          // Mouse: If pointer moves more than 3 pixels, start dragging immediately (no long-press delay)
          if (distance > 3) {
            console.log("onMove: mouse drag starting, distance:", distance);
            setSelectedBooking(null); // close drawer for a cleaner drag UI
            const updated: DragState = { ...drag, isDragging: true, currentX: ev.clientX, currentY: ev.clientY };
            dragStateRef.current = updated;
            setActiveDrag({ ...updated });
          }
          return;
        }
      }

      // Active drag: resolve target column and snapped time slot
      const elements = document.elementsFromPoint(ev.clientX, ev.clientY);
      const columnEl = elements.find((el) => el.classList.contains("agenda-column")) as HTMLElement | undefined;
      const targetDate = columnEl?.getAttribute("data-column-date") ?? drag.booking.booking_date;

      let targetTime = drag.booking.startAt.toFormat("HH:mm");
      if (columnEl) {
        const rect = columnEl.getBoundingClientRect();
        const relativeY = ev.clientY - rect.top;
        const minutes = Math.max(0, Math.min((22 - 6) * 60, relativeY / PX_PER_MINUTE));
        const snapped = Math.round(minutes / 15) * 15;
        const total = 6 * 60 + snapped;
        const h = Math.floor(total / 60);
        const m = total % 60;
        targetTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }

      console.log("onMove (dragging): currentX:", ev.clientX, "currentY:", ev.clientY, "targetDate:", targetDate, "targetTime:", targetTime);

      const updated: DragState = { ...drag, currentX: ev.clientX, currentY: ev.clientY, targetDate, targetTime };
      dragStateRef.current = updated;
      setActiveDrag({ ...updated });
    };

    const onUp = (_ev: PointerEvent) => {
      console.log("onUp: pointer released");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      cleanupDragRef.current = null;

      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

      const drag = dragStateRef.current;
      dragStateRef.current = null;
      setActiveDrag(null);

      if (!drag) {
        console.log("onUp: no active drag found (cancelled before release)");
        return;
      }

      console.log("onUp: ended drag.isDragging =", drag.isDragging);

      if (!drag.isDragging) {
        // Short press (no drag activated) → open detail drawer
        console.log("onUp: short press detected, opening drawer");
        handleSelectBooking(drag.booking);
        return;
      }

      // Drag completed → propose reschedule if date or time changed
      const originalTime = drag.booking.startAt.toFormat("HH:mm");
      console.log("onUp: dragging finished. targetDate:", drag.targetDate, "originalDate:", originalDate, "targetTime:", drag.targetTime, "originalTime:", originalTime);
      if (drag.targetDate !== originalDate || drag.targetTime !== originalTime) {
        setRescheduleConfirm({ booking: drag.booking, targetDate: drag.targetDate, targetTime: drag.targetTime });
      }
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    cleanupDragRef.current = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    // Activate drag after long-press threshold (300 ms) - Touch only
    if (isTouch) {
      console.log("handlePointerDown: setting touch timeout for long-press");
      timerRef.current = setTimeout(() => {
        const drag = dragStateRef.current;
        if (!drag) return;
        console.log("handlePointerDown: touch long-press activated!");
        if (window.navigator?.vibrate) window.navigator.vibrate(40);
        setSelectedBooking(null); // close drawer for a cleaner drag UI
        const updated: DragState = { ...drag, isDragging: true };
        dragStateRef.current = updated;
        setActiveDrag({ ...updated });
      }, 300);
    }
  }, [handleSelectBooking]);

const handleCopy = (text: string, type: "tel" | "wa") => {
if (typeof navigator !== "undefined" && navigator.clipboard) {
navigator.clipboard.writeText(text);
setCopiedText(type);
setTimeout(() => setCopiedText(null), 2000);
}
};

// Sync state during render if initialBookingId changes
const [prevInitialBookingId, setPrevInitialBookingId] = useState<string | null | undefined>(undefined);
if (initialBookingId !== prevInitialBookingId) {
setPrevInitialBookingId(initialBookingId);
if (initialBookingId) {
let found: AgendaBooking | undefined;
for (const day of Object.keys(bookingsByDay)) {
found = bookingsByDay[day]?.find((b) => b.id === initialBookingId);
if (found) break;
}
if (found) {
setSelectedBooking(found);
setDrawerStatus(found.status);
setCopiedText(null);
}
}
}

// Smooth scroll to selected booking on open
useEffect(() => {
if (selectedBooking && scrollContainerRef.current) {
const { start } = toMinutes(selectedBooking);
const top = (start - 6 * 60) * PX_PER_MINUTE;
scrollContainerRef.current.scrollTo({
top: Math.max(0, top - 60),
behavior: "smooth",
});
}
}, [selectedBooking]);



const handleCloseAndSave = () => {
if (selectedBooking) {
// 1. Persist status change if it differs
if (drawerStatus && drawerStatus !== selectedBooking.status) {
if (onStatusUpdate) {
onStatusUpdate(selectedBooking.id, drawerStatus);
}
}
// 2. Persist payment method if one was selected and booking wasn't already paid
if (selectedPaymentMethod && onPaymentRegister && !(selectedBooking.payment?.status === "paid" || selectedBooking.paid_at)) {
onPaymentRegister(selectedBooking.id, selectedPaymentMethod);
}
}
setSelectedBooking(null);
setSelectedPaymentMethod(null);
setCopiedText(null);
// Remove query params from URL to clean up the address bar
if (typeof window !== "undefined") {
const url = new URL(window.location.href);
url.searchParams.delete("bookingId");
url.searchParams.delete("date");
window.history.replaceState({}, "", url.toString());
}
};

const hourMarkers = timelineSlots.filter((slot) => slot.endsWith(":00"));
const canvasHeight = (22 - 6) * 60 * PX_PER_MINUTE;

return (
<section
aria-label="Timeline de citas"
className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-md)] sm:p-5 dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-md)]"
>
<div ref={scrollContainerRef} className="min-h-0 overflow-auto">
<div className="min-w-[880px]">
<div className={`grid gap-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}>
{/* ── Sticky Header Row ── */}
<div
className={`sticky top-0 z-40 col-span-full grid gap-2 pb-2 ${columns.length > 1 ? "grid-cols-[92px_repeat(7,minmax(0,1fr))]" : "grid-cols-[92px_minmax(0,1fr)]"}`}
style={{
background: `linear-gradient(to bottom, var(--surface-3) 70%, color-mix(in srgb, var(--surface-3) 95%, transparent) 92%, transparent 100%)`,
}}
>
<div className="flex items-center px-2 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
Hora
</div>
{columns.length > 1 && columns.map((column) => (
<div
key={column.isoDate}
className={`rounded-2xl border px-3 py-2 text-sm shadow-[var(--shadow-sm)] ${
column.isToday
? "border-[var(--app-primary)] bg-[color-mix(in_srgb,var(--app-primary)_8%,var(--surface-3))] text-[var(--app-primary)]"
: "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:text-[var(--text-muted)]"
}`}
>
<div className="flex items-center justify-between">
<p className={`font-bold tracking-tight ${column.isToday ? "text-[var(--app-primary-strong)] dark:text-[var(--app-primary)]" : "text-[var(--text-primary)]"}`}>{column.dayLabel}</p>
{column.isToday && <span className="rounded-full bg-[var(--app-primary)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--surface-3)]">Hoy</span>}
</div>
<p className={`text-[11px] font-bold uppercase tracking-widest ${column.isToday ? "text-[var(--app-primary)]" : "text-[var(--app-primary)]"}`}>{column.dateLabel}</p>
</div>
))}
{columns.length === 1 && <div className="pointer-events-none"></div>}
</div>

<div className="sticky left-0 z-20 relative bg-[inherit]">
{hourMarkers.map((hour) => {
const [hours] = hour.split(":");
// Posicionar la etiqueta exactamente en la línea de la hora, no a la mitad (+30)
const top = (Number(hours) - 6) * 60 * PX_PER_MINUTE;
return (
<div key={hour} className="absolute inset-x-0" style={{ top }}>
<p className="-translate-y-1/2 px-2 text-[11px] font-bold tracking-widest text-[var(--text-muted)]">{hour}</p>
</div>
);
})}
</div>

{columns.map((column) => {
const positioned = layoutDayBookings(bookingsByDay[column.isoDate] ?? []);

return (
<div
key={column.isoDate}
className="agenda-column relative overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-sm)]"
data-column-date={column.isoDate}
style={{ height: canvasHeight }}
role="group"
aria-label={`${column.dayLabel} ${column.dateLabel}`}
>
{/* Snap Preview Shadow */}
{activeDrag && activeDrag.isDragging && activeDrag.targetDate === column.isoDate && (
<div
className="absolute border-2 border-dashed border-[var(--app-primary)] bg-[var(--app-primary)]/10 rounded-[var(--radius-xs)] transition-all duration-150 pointer-events-none z-10"
style={{
top: (() => {
const [h, m] = activeDrag.targetTime.split(":").map(Number);
return ((h - 6) * 60 + m) * PX_PER_MINUTE;
})(),
height: activeDrag.height,
left: 3,
right: 3,
}}
>
<div className="flex h-full flex-col justify-between p-2 text-[var(--app-primary)] opacity-70">
<span className="text-[10px] font-bold tracking-wider">
Mover a las {activeDrag.targetTime}
</span>
</div>
</div>
)}
{hourMarkers.map((hour) => {
const [hours] = hour.split(":");
const top = (Number(hours) - 6) * 60 * PX_PER_MINUTE;
return (
<div
key={`${column.isoDate}-${hour}`}
className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[var(--border-strong)]"
style={{ top }}
aria-hidden="true"
/>
);
})}

{column.isToday && <CurrentTimeLine />}

                        {positioned.map((item) => renderEventBlock(
                          item,
                          handleSelectBooking,
                          columns.length > 1,
                          activeDrag,
                          handlePointerDown
                        ))}
</div>
);
})}
</div>
</div>
</div>

{/* ── Detailed Customer Drawer ── */}
<AnimatePresence>
{selectedBooking && (
<>
{/* Backdrop */}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
className="fixed inset-0 z-50 bg-[var(--text-primary)]/10 backdrop-blur-sm"
onClick={handleCloseAndSave}
/>

{/* Side Drawer */}
<motion.aside
initial={{ x: "100%" }}
animate={{ x: 0 }}
exit={{ x: "100%" }}
transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
className="fixed inset-y-0 right-0 z-55 flex w-[90vw] max-w-[400px] flex-col overflow-hidden rounded-l-[var(--radius-lg)] border-l border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
>
{/* Header */}
<header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)] px-5">
<div className="flex items-center gap-3">
<button
type="button"
onClick={handleCloseAndSave}
className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] active:scale-95 border border-[var(--border-strong)] bg-[var(--surface-3)]/60"
>
<ChevronRight className="h-5 w-5" strokeWidth={2.5} />
</button>
<div>
<p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--app-primary)]">
Detalle de Cita
</p>
<h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] truncate max-w-[200px]">
{selectedBooking.serviceName}
</h2>
</div>
</div>
{/* Status Badge */}
<span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
(drawerStatus || selectedBooking.status) === "confirmed" ? "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20" :
(drawerStatus || selectedBooking.status) === "completed" ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border(--color-success)]/20" :
(drawerStatus || selectedBooking.status) === "cancelled" ? "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20" :
"bg-[var(--color-pending)]/10 text-[var(--color-pending)] border border-[var(--color-pending)]/20"
}`}>
{(drawerStatus || selectedBooking.status) === "confirmed" ? "Confirmada" :
(drawerStatus || selectedBooking.status) === "completed" ? "Completada" :
(drawerStatus || selectedBooking.status) === "cancelled" ? "Cancelada" : "Pendiente"}
</span>
</header>

{/* Body */}
<div className="min-h-0 flex-1 overflow-y-auto">
<div className="flex flex-col min-h-full p-4 justify-between gap-3.5">
{/* Top content group */}
<div className="space-y-3.5">
{/* 1. Card de Cita y Cliente (Combined & Compact) */}
<div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3.5 shadow-[var(--shadow-sm)] space-y-3">
<div className="flex items-start justify-between gap-4">
{/* Left Side: Client Name & Booking Details */}
<div className="min-w-0 flex-1 space-y-2.5">
<div>
<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
Cliente
</p>
<p className="text-base font-extrabold text-[var(--text-primary)] mt-0.5 break-words">
{selectedBooking.customer_name ?? "Cliente sin nombre"}
</p>
</div>

{/* Date, Time, and Staff info */}
<div className="space-y-1 text-xs text-[var(--text-secondary)] font-semibold">
<div className="flex items-center gap-1.5">
<Clock className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
<span className="truncate">
{selectedBooking.startAt.toFormat("dd LLL yyyy")}
<span className="mx-1 text-[var(--text-muted)] font-normal">|</span>
<span className="text-[var(--text-primary)]">
{selectedBooking.startAt.toFormat("HH:mm")}-{selectedBooking.endAt.toFormat("HH:mm")}
</span>
</span>
</div>
<div className="flex items-center gap-1.5">
<User className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
<span className="truncate">
Prof: <span className="text-[var(--text-primary)]">{selectedBooking.staffName}</span>
</span>
</div>
</div>
</div>

{/* Right Side: Stacking contact items vertically */}
<div className="space-y-2 shrink-0 text-right">
{selectedBooking.customer_phone && (
<div className="flex items-center justify-end gap-2.5">
<button
type="button"
onClick={() => handleCopy(selectedBooking.customer_phone!, "tel")}
className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-right"
title="Haga clic para copiar número"
>
{copiedText === "tel" ? (
<span className="text-[var(--color-info)] font-bold">✓ ¡Copiado!</span>
) : (
selectedBooking.customer_phone
)}
</button>
<a
href={`tel:${selectedBooking.customer_phone}`}
title="Llamar"
className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--color-info)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.90]"
>
<Phone className="h-3.5 w-3.5" />
</a>
</div>
)}

{selectedBooking.customer_whatsapp && (
<div className="flex items-center justify-end gap-2.5">
<button
type="button"
onClick={() => handleCopy(selectedBooking.customer_whatsapp!, "wa")}
className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-right"
title="Haga clic para copiar WhatsApp"
>
{copiedText === "wa" ? (
<span className="text-[var(--color-success)] font-bold">✓ ¡Copiado!</span>
) : (
selectedBooking.customer_whatsapp
)}
</button>
<a
href={`https://wa.me/${selectedBooking.customer_whatsapp.replace(/\D/g, "")}`}
target="_blank"
rel="noopener noreferrer"
title="Abrir en WhatsApp"
className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--color-success)] transition-all hover:bg-[var(--surface-1)] active:scale-[0.90]"
>
<MessageSquare className="h-3.5 w-3.5" />
</a>
</div>
)}

{selectedBooking.customer_email && (
<div className="flex items-center justify-end gap-2.5">
<span className="text-[11px] font-semibold text-[var(--text-secondary)] truncate max-w-[160px]" title={selectedBooking.customer_email}>
{selectedBooking.customer_email}
</span>
<div className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-muted)]">
<Mail className="h-3.5 w-3.5" />
</div>
</div>
)}
</div>
</div>

{/* Unified Observaciones (Booking Notes) inside the client card below the columns */}
{selectedBooking.notes && selectedBooking.notes.trim() !== "" && (
<div className="border-t border-[var(--border-soft)] pt-2.5 space-y-1">
<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
Observaciones
</p>
<p className="text-xs leading-relaxed text-[var(--text-secondary)] italic bg-[var(--surface-2)] p-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)]">
{selectedBooking.notes}
</p>
</div>
)}
</div>

{/* 2. BookingTimeline (Rendered transparent on the base surface var(--surface-2)) */}
<div className="px-1.5">
<BookingTimeline booking={selectedBooking} statusOverride={drawerStatus} statusBeforeCancel={statusBeforeCancel} />
</div>
</div>

{/* Bottom content group (Actions unified in a single Card) */}
<div className="space-y-3.5 mt-auto">
<div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-3.5 shadow-[var(--shadow-sm)]">
{/* Cobro en Sucursal Section (only if not cancelled) */}
<AnimatePresence initial={false}>
{(drawerStatus || selectedBooking.status) !== "cancelled" && (
<motion.div
key="cobro-section"
initial={{ opacity: 0, height: 0, overflow: "hidden" }}
animate={{ opacity: 1, height: "auto" }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
>
<div className="space-y-2">
<div className="flex items-center gap-2">
<Wallet className="h-3.5 w-3.5 text-[var(--text-muted)]" />
<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
Cobro en Sucursal
</h3>
</div>

<AnimatePresence mode="wait">
{selectedBooking.payment?.status === "paid" || selectedBooking.paid_at ? (
<motion.div
key="paid-badge"
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 0.2 }}
className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 px-3 py-2"
>
<CheckCircle2 className="h-4 w-4 text-[var(--color-success)] shrink-0" />
<p className="text-xs font-bold text-[var(--color-success)]">
Pagado vía {selectedBooking.payment?.payment_method === "cash" ? "Efectivo" : selectedBooking.payment?.payment_method === "credit_card" ? "Tarjeta" : selectedBooking.payment?.payment_method === "transfer" ? "Transferencia" : "—"}
</p>
</motion.div>
) : (
<motion.div
key="pay-options"
initial={{ opacity: 0, y: 4 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -4 }}
transition={{ duration: 0.2 }}
className="grid grid-cols-3 gap-2"
>
{([
{ method: "cash" as PaymentMethod, label: "Efectivo", icon: Banknote },
{ method: "credit_card" as PaymentMethod, label: "Tarjeta", icon: CreditCard },
{ method: "transfer" as PaymentMethod, label: "Transfer.", icon: ArrowLeftRight },
]).map((option) => (
<button
key={option.method}
type="button"
onClick={() => setSelectedPaymentMethod(option.method)}
className={`flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-2 transition-all active:scale-[0.96] ${
selectedPaymentMethod === option.method
? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-success)] shadow-[0_0_0_1px_var(--color-success)]"
: "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[var(--color-success)]/40 hover:bg-[var(--color-success)]/5 hover:text-[var(--color-success)]"
}`}
>
<option.icon className="h-4 w-4" />
<span className="text-[10px] font-bold">{option.label}</span>
</button>
))}
</motion.div>
)}
</AnimatePresence>
</div>

<div className="border-t border-[var(--border-soft)] mt-3 mb-2.5" />
</motion.div>
)}
</AnimatePresence>

{/* Estado de la Cita Section */}
<div className="space-y-3 flex flex-col items-center">
<div className="flex items-center gap-2 w-full">
<CheckCircle2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
<h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] text-left">
Estado de la Cita
</h3>
</div>

<SegmentedControl
name="booking-status-selector"
width={108}
colorizeSelected={true}
value={drawerStatus || selectedBooking.status}
onChange={(newStatus) => {
setDrawerStatus(newStatus as AgendaBooking["status"]);
setStatusBeforeCancel(null);
}}
options={[
{ value: "pending", label: "Pendiente", icon: Clock, activeColor: "var(--color-pending)" },
{ value: "confirmed", label: "Confirmada", icon: Check, activeColor: "var(--color-info)" },
{ value: "completed", label: "Completada", icon: CheckCircle2, activeColor: "var(--color-success)" },
]}
/>

<div className="relative w-full group">
<button
type="button"
onClick={() => {
setStatusBeforeCancel(drawerStatus || selectedBooking.status);
setDrawerStatus("cancelled");
}}
disabled={(drawerStatus || selectedBooking.status) === "cancelled" || (drawerStatus || selectedBooking.status) === "completed"}
className="w-full py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] text-xs font-bold text-[var(--color-error)] transition-all hover:bg-[var(--color-error)]/10 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
>
Cancelar Cita
</button>
{((drawerStatus || selectedBooking.status) === "cancelled" || (drawerStatus || selectedBooking.status) === "completed") && (
<div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--text-primary)] px-3.5 py-2 text-xs font-bold text-[var(--surface-3)] opacity-0 group-hover:opacity-100 transition-opacity shadow-[var(--shadow-lg)] border border-[var(--border-strong)] z-30">
{(drawerStatus || selectedBooking.status) === "cancelled" ? "Esta cita ya fue cancelada" : "No se puede cancelar una cita completada"}
<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--text-primary)]" />
</div>
)}
</div>
</div>
</div>
</div>
</div>
</div>

{/* Footer Actions */}
<div className="mt-auto shrink-0 border-t border-[var(--border-strong)] bg-[var(--surface-1)] p-4">
<button
type="button"
onClick={handleCloseAndSave}
className="w-full py-3 rounded-xl bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))] text-xs font-bold text-[var(--surface-3)] shadow-[var(--shadow-md)] transition-all hover:brightness-110 active:scale-[0.98]"
>
Guardar
</button>
</div>
</motion.aside>
</>
)}
</AnimatePresence>

{/* ── Reschedule Confirmation Modal ── */}
<AnimatePresence>
{rescheduleConfirm && (
<>
{/* Backdrop */}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={() => setRescheduleConfirm(null)}
className="fixed inset-0 z-[100] bg-[var(--text-primary)]/10 backdrop-blur-sm"
/>
{/* Modal Container */}
<motion.div
initial={{ opacity: 0, scale: 0.95, y: 15 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 15 }}
transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
className="fixed inset-x-4 bottom-6 z-[101] mx-auto max-w-[420px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-lg)] sm:bottom-auto sm:top-[20%] dark:border-[var(--border-strong)] dark:bg-[var(--surface-3)] dark:shadow-[var(--shadow-lg)]"
>
{/* Header */}
<div className="flex items-center gap-3 border-b border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
<ArrowLeftRight className="h-5 w-5" />
</div>
<div>
<h3 className="text-sm font-extrabold text-[var(--text-primary)]">
Confirmar Reprogramación
</h3>
<p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
¿Desea cambiar la fecha/hora?
</p>
</div>
</div>

{/* Body comparing Before & After */}
<div className="p-5 space-y-4">
<div className="grid grid-cols-2 gap-4">
{/* Before */}
<div className="p-3 bg-[var(--surface-2)] rounded-[var(--radius-sm)] border border-[var(--border-strong)] shadow-[var(--shadow-sm)]">
<p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
Antes
</p>
<p className="text-[11px] font-extrabold text-[var(--text-secondary)]">
{rescheduleConfirm.booking.startAt.toFormat("dd LLL yyyy")}
</p>
<p className="text-[13px] font-extrabold text-[var(--text-primary)] mt-0.5">
{rescheduleConfirm.booking.startAt.toFormat("HH:mm")}
</p>
</div>
{/* After */}
<div className="p-3 bg-[var(--app-primary)]/5 rounded-[var(--radius-sm)] border border-[var(--app-primary)]/20 shadow-[var(--shadow-sm)]">
<p className="text-[9px] font-bold uppercase tracking-wider text-[var(--app-primary)] mb-1">
Después
</p>
<p className="text-[11px] font-extrabold text-[var(--text-secondary)]">
{DateTime.fromISO(rescheduleConfirm.targetDate).setLocale("es").toFormat("dd LLL yyyy")}
</p>
<p className="text-[13px] font-extrabold text-[var(--app-primary)] mt-0.5">
{rescheduleConfirm.targetTime}
</p>
</div>
</div>

<div className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-strong)] p-3 text-[11px] text-[var(--text-secondary)] leading-relaxed flex gap-2">
<Clock className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
<div>
La cita de <span className="font-extrabold text-[var(--text-primary)]">{rescheduleConfirm.booking.customer_name ?? "Cliente sin nombre"}</span> para <span className="font-extrabold text-[var(--text-primary)]">{rescheduleConfirm.booking.serviceName}</span> se reprogramará.
</div>
</div>
</div>

{/* Actions Footer */}
<div className="flex gap-2 border-t border-[var(--border-soft)] bg-[var(--surface-2)] p-4">
<button
type="button"
onClick={() => setRescheduleConfirm(null)}
className="flex-1 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-1)] active:scale-[0.98] transition-all"
>
Cancelar
</button>
<button
type="button"
onClick={() => {
const confirmBooking = rescheduleConfirm;
setRescheduleConfirm(null);
onReschedule(confirmBooking.booking.id, confirmBooking.targetDate, confirmBooking.targetTime);
}}
className="flex-1 py-2.5 rounded-xl bg-[linear-gradient(135deg,var(--app-primary),var(--app-primary-strong))] text-xs font-bold text-[var(--surface-3)] shadow-[var(--shadow-md)] hover:brightness-110 active:scale-[0.98] transition-all"
>
Confirmar
</button>
</div>
</motion.div>
</>
)}
</AnimatePresence>
</section>
);
}
