"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CalendarPlus, Clock, User, Phone, Mail } from "lucide-react";
import AppIcon from "@/components/ui/AppIcon";
import CustomSelect from "@/components/ui/CustomSelect";
import type { CreateBookingInput } from "@/lib/api/bookings";
import type { Service, Staff } from "@/types";

interface ManualBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateBookingInput) => Promise<void>;
  initialDate?: string;
  initialStartTime?: string;
  initialStaffId?: string;
  staff: Staff[];
  services: Service[];
  businessId: string;
  branchId: string;
  branchName?: string;
}

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

export default function ManualBookingDrawer({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialStartTime,
  initialStaffId,
  staff,
  services,
  businessId,
  branchId,
  branchName,
}: ManualBookingDrawerProps) {
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState<string>(initialStaffId || staff[0]?.id || "");
  const [bookingDate, setBookingDate] = useState<string>(initialDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>(initialStartTime || "09:00");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      if (initialDate) setBookingDate(initialDate);
      if (initialStartTime) setStartTime(initialStartTime);
      if (initialStaffId) setStaffId(initialStaffId);
      else if (staff.length > 0 && !staffId) setStaffId(staff[0].id);
      if (services.length > 0 && !serviceId) setServiceId(services[0].id);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    }
  }, [isOpen, initialDate, initialStartTime, initialStaffId, staff, services]);

  const serviceOptions = useMemo(() => {
    return services.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.duration_minutes} min - $${Number(s.price).toLocaleString("es-CO")})`,
    }));
  }, [services]);

  const staffOptions = useMemo(() => {
    return staff.map((s) => ({
      value: s.id,
      label: s.name,
    }));
  }, [staff]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === serviceId);
  }, [services, serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !staffId || !bookingDate || !startTime || !customerName.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        business_id: businessId,
        branch_id: branchId,
        service_id: serviceId,
        staff_id: staffId,
        booking_date: bookingDate,
        start_time: startTime,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        customer_whatsapp: customerPhone.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 bg-[var(--text-primary)]/15 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer Container */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-screen max-w-md bg-[var(--surface-2)] shadow-[var(--shadow-lg)] rounded-l-[var(--radius-2xl)] border-l border-[var(--border-strong)] flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-strong)] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-white shadow-[var(--shadow-sm)]">
                    <CalendarPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                      Nueva Cita Manual
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      {branchName ? `Sede: ${branchName}` : "Registrar cita para cliente"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <AppIcon icon={X} size="sm" />
                </button>
              </div>

              {/* Form Body */}
              <form id="manual-booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Section 1: Servicio y Especialista */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-3.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    1. Servicio y Especialista
                  </label>

                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Servicio <span className="text-[var(--color-error)]">*</span>
                    </span>
                    {serviceOptions.length > 0 ? (
                      <CustomSelect
                        value={serviceId}
                        options={serviceOptions}
                        onChange={setServiceId}
                      />
                    ) : (
                      <p className="text-xs text-[var(--color-pending)]">No hay servicios registrados.</p>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Especialista <span className="text-[var(--color-error)]">*</span>
                    </span>
                    {staffOptions.length > 0 ? (
                      <CustomSelect
                        value={staffId}
                        options={staffOptions}
                        onChange={setStaffId}
                      />
                    ) : (
                      <p className="text-xs text-[var(--color-pending)]">No hay especialistas asignados.</p>
                    )}
                  </div>
                </div>

                {/* Section 2: Fecha y Hora */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-3.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    2. Fecha y Horario
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Fecha <span className="text-[var(--color-error)]">*</span>
                      </span>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--app-primary)]"
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Hora inicio <span className="text-[var(--color-error)]">*</span>
                      </span>
                      <CustomSelect
                        value={startTime}
                        options={TIME_OPTIONS}
                        onChange={setStartTime}
                      />
                    </div>
                  </div>

                  {selectedService && (
                    <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)] border border-[var(--border-soft)]">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary)] text-white">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                      <span>Duración estimada: <strong className="text-[var(--text-primary)]">{selectedService.duration_minutes} min</strong></span>
                    </div>
                  )}
                </div>

                {/* Section 3: Datos del Cliente */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-3.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    3. Datos del Cliente
                  </label>

                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Nombre completo <span className="text-[var(--color-error)]">*</span>
                    </span>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="Ej. Carlos Rodríguez"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--app-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Teléfono / Celular
                      </span>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <input
                          type="tel"
                          placeholder="300 123 4567"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--app-primary)]"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        Correo electrónico
                      </span>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <input
                          type="email"
                          placeholder="cliente@ejemplo.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--app-primary)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      Notas internas u observaciones
                    </span>
                    <textarea
                      placeholder="Ej. Viene por recomendación, desea atención prioritaria..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--app-primary)] resize-none"
                    />
                  </div>
                </div>
              </form>

              {/* Footer Actions */}
              <div className="border-t border-[var(--border-strong)] bg-[var(--surface-3)] p-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="manual-booking-form"
                  disabled={submitting || !customerName.trim() || !serviceId || !staffId}
                  className="rounded-[var(--radius-md)] bg-[var(--app-primary)] px-5 py-2 text-xs font-bold text-white shadow-[var(--shadow-sm)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    "Agendando..."
                  ) : (
                    <>
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>Confirmar Cita</span>
                    </>
                  )}
                </button>
              </div>
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
