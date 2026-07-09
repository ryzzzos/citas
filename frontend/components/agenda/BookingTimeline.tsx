import { DateTime } from "luxon";
import { 
  CheckCircle2, 
  Sparkles, 
  XCircle, 
  PlusCircle, 
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgendaBooking } from "@/lib/agenda/types";

interface BookingTimelineProps {
  booking: AgendaBooking;
  statusOverride?: AgendaBooking["status"] | null;
  statusBeforeCancel?: AgendaBooking["status"] | null;
}

interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  isFinished: boolean;
  isCurrent: boolean;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeText: string;
  badgeClass: string;
}

export default function BookingTimeline({ booking, statusOverride, statusBeforeCancel }: BookingTimelineProps) {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "";
    const parsed = DateTime.fromISO(isoString);
    return parsed.isValid ? parsed.toFormat("HH:mm") : "";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const status = statusOverride || booking.status;
  const isCancelled = status === "cancelled";
  
  let isConfirmed = false;
  let isPaid = false;
  let isCompleted = false;
  
  if (status === "cancelled") {
    // Use the state the user was at BEFORE pressing cancel.
    // This determines how far the progress bar fills before the red cancel node.
    const prev = statusBeforeCancel || booking.status;
    if (prev === "pending") {
      isConfirmed = false;
      isPaid = false;
      isCompleted = false;
    } else if (prev === "confirmed") {
      isConfirmed = true;
      isPaid = false;
      isCompleted = false;
    } else if (prev === "completed") {
      isConfirmed = true;
      isPaid = true;
      isCompleted = true;
    }
  } else if (status === "pending") {
    isConfirmed = false;
    isPaid = false;
    isCompleted = false;
  } else if (status === "confirmed") {
    isConfirmed = true;
    isPaid = booking.payment?.status === "paid" || !!booking.paid_at;
    isCompleted = false;
  } else if (status === "completed") {
    isConfirmed = true;
    isPaid = true;
    isCompleted = true;
  }

  const amount = booking.payment?.amount || 0;
  const method = booking.payment?.payment_method || "pending";
  let paymentMethodLabel = "Pendiente";
  if (method === "cash") paymentMethodLabel = "Efectivo";
  else if (method === "credit_card") paymentMethodLabel = "Tarjeta";
  else if (method === "transfer") paymentMethodLabel = "Transferencia";

  // Build the list of steps
  const steps: TimelineStep[] = [];

  // 1. Creada (Always completed)
  steps.push({
    id: "created",
    title: "Cita Registrada",
    subtitle: "Cita recibida en espera de confirmación.",
    isFinished: true,
    isCurrent: status === "pending" && !isCancelled,
    timestamp: formatTime(booking.created_at),
    icon: PlusCircle,
    colorClass: "bg-[var(--color-pending)] text-[var(--surface-3)] border-[var(--color-pending)]",
    badgeText: "Creada",
    badgeClass: "bg-[var(--color-pending)]/10 text-[var(--color-pending)] border border-[var(--color-pending)]/20",
  });

  // 2. Confirmada
  steps.push({
    id: "confirmed",
    title: "Agenda Confirmada",
    subtitle: isConfirmed 
      ? "Cita aprobada y agendada con el profesional."
      : "En espera de aprobación del comercio.",
    isFinished: isConfirmed,
    isCurrent: status === "confirmed" && !isPaid && !isCancelled,
    timestamp: booking.confirmed_at ? formatTime(booking.confirmed_at) : (isConfirmed ? "Ahora" : ""),
    icon: CheckCircle2,
    colorClass: isConfirmed
      ? "bg-[var(--color-info)] text-[var(--surface-3)] border-[var(--color-info)]"
      : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-strong)]",
    badgeText: isConfirmed ? "Confirmada" : "Pendiente",
    badgeClass: isConfirmed
      ? "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20"
      : "bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border-strong)]",
  });

  // 3. Pagada
  steps.push({
    id: "paid",
    title: "Registro de Pago",
    subtitle: isPaid
      ? `Pago de ${formatCurrency(amount)} registrado vía ${paymentMethodLabel}.`
      : "Pendiente de cobro en sucursal.",
    isFinished: isPaid,
    isCurrent: status === "confirmed" && isPaid && !isCancelled,
    timestamp: booking.paid_at ? formatTime(booking.paid_at) : (isPaid ? "Ahora" : ""),
    icon: Wallet,
    colorClass: isPaid
      ? "bg-[var(--color-success)] text-[var(--surface-3)] border-[var(--color-success)]"
      : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-strong)]",
    badgeText: isPaid ? paymentMethodLabel : "Pendiente",
    badgeClass: isPaid
      ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
      : "bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border-strong)]",
  });

  // 4. Completada
  steps.push({
    id: "completed",
    title: "Servicio Finalizado",
    subtitle: isCompleted
      ? "Servicio realizado y completado físicamente."
      : "Tratamiento o cita pendiente de realizarse.",
    isFinished: isCompleted,
    isCurrent: false, // Once completed, the flow finishes.
    timestamp: booking.completed_at ? formatTime(booking.completed_at) : (isCompleted ? "Ahora" : ""),
    icon: Sparkles,
    colorClass: isCompleted
      ? "bg-[var(--app-primary)] text-[var(--surface-3)] border-[var(--app-primary)]"
      : "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-strong)]",
    badgeText: isCompleted ? "Finalizado" : "Pendiente",
    badgeClass: isCompleted
      ? "bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20"
      : "bg-[var(--surface-3)] text-[var(--text-muted)] border border-[var(--border-strong)]",
  });

  // 5. Cancelada (Only render at the end if cancelled)
  if (isCancelled) {
    steps.push({
      id: "cancelled",
      title: "Cita Cancelada",
      subtitle: booking.notes?.includes("[Sistema]") 
        ? "Cancelada por inasistencia del cliente (No-Show)." 
        : "Cita anulada por el cliente o sucursal.",
      isFinished: true,
      isCurrent: false,
      timestamp: booking.cancelled_at ? formatTime(booking.cancelled_at) : (isCancelled ? "Ahora" : ""),
      icon: XCircle,
      colorClass: "bg-[var(--color-error)] text-[var(--surface-3)] border-[var(--color-error)]",
      badgeText: "Cancelada",
      badgeClass: "bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20",
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
        Línea de Tiempo
      </h3>

      <div className="relative pl-0.5">
        <div className="space-y-0 relative z-10">
          <AnimatePresence initial={false}>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;

              // Calculate connection line color to the next step
              const nextStep = steps[idx + 1];
              let connectorColor = "var(--border-strong)"; // Default gray
              if (nextStep && nextStep.isFinished) {
                if (nextStep.id === "cancelled") {
                  connectorColor = "var(--color-error)";
                } else if (nextStep.id === "paid" || nextStep.id === "completed") {
                  connectorColor = "var(--color-success)";
                } else if (nextStep.id === "confirmed") {
                  connectorColor = "var(--color-info)";
                }
              }
              
              return (
                <motion.div
                  key={step.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="flex items-stretch gap-3"
                >
                  {/* Left Column: Circle + Connector Line */}
                  <div className="flex flex-col items-center shrink-0 self-stretch">
                    <motion.div 
                      layout
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors duration-300 z-10 ${step.colorClass}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.div>
                    
                    {!isLast && (
                      <motion.div
                        animate={{ backgroundColor: connectorColor }}
                        transition={{ duration: 0.4 }}
                        className="w-[1.5px] flex-1 origin-top"
                      />
                    )}
                  </div>

                  {/* Content Column */}
                  <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-xs font-bold ${step.isFinished ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                        {step.title}
                      </p>
                      {step.badgeText && (
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${step.badgeClass}`}>
                          {step.badgeText}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed font-semibold">
                      {step.subtitle}
                    </p>
                  </div>

                  {/* Timestamp */}
                  {step.timestamp && (
                    <div className="shrink-0 text-right pb-4">
                      <p className="text-[10px] font-extrabold text-[var(--text-secondary)] bg-[var(--surface-3)] dark:bg-[var(--surface-3)] px-1.5 py-0.5 rounded-md border border-[var(--border-strong)]">
                        {step.timestamp}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
