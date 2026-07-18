"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBranchContext } from "@/contexts/BranchContext";
import { getBusinessAlerts, type BookingAlert } from "@/lib/api/businesses";
import { DateTime } from "luxon";

const getAlertTimeText = (alert: BookingAlert) => {
  try {
    const dt = DateTime.fromISO(alert.booking.booking_date);
    const today = DateTime.local().startOf("day");
    const yesterday = today.minus({ days: 1 });
    const timeStr = alert.booking.start_time.substring(0, 5);
    
    if (dt.hasSame(today, "day")) {
      return timeStr;
    } else if (dt.hasSame(yesterday, "day")) {
      return `Ayer, ${timeStr}`;
    } else {
      const formattedDate = dt.setLocale("es").toFormat("d MMM");
      return `${formattedDate}, ${timeStr}`;
    }
  } catch {
    return alert.booking.start_time.substring(0, 5);
  }
};

const getAlertStatusText = (alert: BookingAlert) => {
  if (alert.type === "pending_confirmation") {
    return "Por confirmar";
  }
  try {
    const bookingDate = DateTime.fromISO(alert.booking.booking_date);
    const today = DateTime.local().startOf("day");
    const diffDays = Math.round(today.diff(bookingDate, "days").days);
    
    if (diffDays === 0) return "Sin completar hoy";
    if (diffDays === 1) return "Sin completar ayer";
    return `Sin completar hace ${diffDays} días`;
  } catch {
    return "Sin completar";
  }
};

export default function NavbarNotifications() {
  const router = useRouter();
  const { business, setActiveBranch } = useBranchContext();
  const [alerts, setAlerts] = useState<BookingAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!business?.id) return;
    const businessId = business.id;
    const businessTimezone = business.timezone || "UTC";
    let active = true;

    async function loadAlerts() {
      try {
        const res = await getBusinessAlerts(businessId, businessTimezone);
        if (active) {
          setAlerts(res);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load business alerts:", err);
        if (active) setLoading(false);
      }
    }

    loadAlerts();
    // Poll for alerts every 60 seconds
    const interval = setInterval(loadAlerts, 60000);

    const handleRefresh = () => {
      loadAlerts();
    };

    window.addEventListener("booking-updated", handleRefresh);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("booking-updated", handleRefresh);
    };
  }, [business?.id, business?.timezone]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAlertClick = (alert: BookingAlert) => {
    setIsOpen(false);
    if (alert.booking.branch_id) {
      setActiveBranch(alert.booking.branch_id);
    }
    // Redirect to the agenda, loading the booking date and auto-opening the drawer
    const targetBranch = alert.booking.branch_id ? `&branchId=${alert.booking.branch_id}` : "";
    router.push(
      `/dashboard/agenda?bookingId=${alert.booking.id}&date=${alert.booking.booking_date}${targetBranch}`
    );
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)] active:scale-[0.95]"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <motion.div
          whileHover={{
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
          className="relative"
        >
          <Bell className="h-5 w-5" />
        </motion.div>
        
        {/* Pulsing alert count badge */}
        {alerts.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-error)] opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-error)]"></span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.1, y: -20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10, x: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 mt-2.5 w-80 rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[var(--shadow-lg)] overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-strong)] p-3.5 bg-[var(--surface-2)]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Alertas de Agenda
              </span>
              {alerts.length > 0 && (
                <span className="rounded-full bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 px-2 py-0.5 text-[9px] font-bold text-[var(--color-error)] uppercase tracking-wider">
                  {alerts.length} Pendientes
                </span>
              )}
            </div>

            {/* Content List */}
            <div className="max-h-[75vh] overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-6 space-y-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)]" />
                  <p className="text-[11px] font-semibold text-[var(--text-muted)]">Cargando alertas...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-primary)]">¡Todo al día!</p>
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] leading-relaxed max-w-[200px] mx-auto">
                      No tienes citas pendientes de confirmar ni alertas en la agenda.
                    </p>
                  </div>
                </div>
              ) : (
                alerts.map((alert) => {
                  const isPending = alert.type === "pending_confirmation";
                  const Icon = isPending ? Clock : AlertCircle;
                  const iconColorClass = isPending 
                    ? "bg-[var(--color-pending)] text-white border-transparent"
                    : "bg-[var(--color-error)] text-white border-transparent";
                  
                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => handleAlertClick(alert)}
                      className="w-full text-left p-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] hover:bg-[var(--surface-1)] transition-all flex items-center gap-3 active:scale-[0.98] shadow-[var(--shadow-sm)]"
                    >
                      {/* Left Squircle icon container (iPhone app icon layout) */}
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] border ${iconColorClass}`}>
                        <Icon className="h-5.5 w-5.5 stroke-[2.25]" />
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between h-11 py-0.5">
                        {/* Top header row inside banner */}
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[12px] font-extrabold text-[var(--text-primary)] truncate">
                            {alert.booking.customer_name || "Cliente"}
                          </p>
                          <span className="text-[9.5px] font-extrabold text-[var(--text-muted)] tabular-nums shrink-0 uppercase tracking-wider">
                            {getAlertTimeText(alert)}
                          </span>
                        </div>
                        
                        {/* Alert message body */}
                        <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate leading-none">
                          {alert.booking.service_name || "Servicio"} <span className="text-[var(--text-muted)] font-normal mx-1">•</span> <span className={isPending ? "text-[var(--color-pending)] font-semibold" : "text-[var(--color-error)] font-semibold"}>{getAlertStatusText(alert)}</span>
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
