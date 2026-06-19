import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Calendar as CalendarIcon, Clock, ArrowRight, User, Mail, Phone, MessageCircle, FileText } from "lucide-react";

import type { Business, Service, Staff, Branch } from "@/types";
import { getAvailability, createBooking } from "@/lib/api";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface ServiceBookingDrawerProps {
  open: boolean;
  onClose: () => void;
  business: Business;
  service: Service | null;
  branch: Branch | null;
  staffList: Staff[];
}

export default function ServiceBookingDrawer({
  open,
  onClose,
  business,
  service,
  branch,
  staffList,
}: ServiceBookingDrawerProps) {
  const router = useRouter();
  
  const [date, setDate] = useState<string>("");
  const [slotsMap, setSlotsMap] = useState<Record<string, string[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  
  // Customer contact info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  const isCustomerInfoValid = customerName.trim().length > 0 && customerEmail.trim().length > 0;

  const minBookingDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter all staff in the branch that can perform the service
  const baseAvailableStaff = useMemo(() => {
    if (!branch || !service) return [];
    return staffList.filter(
      (s) => s.branch_id === branch.id && s.service_ids?.includes(service.id)
    );
  }, [branch, service, staffList]);

  // Derived staff list based on the selected time slot
  const slotAvailableStaff = useMemo(() => {
    if (!selectedSlot || !slotsMap[selectedSlot]) return [];
    const availableIds = slotsMap[selectedSlot];
    return baseAvailableStaff.filter(s => availableIds.includes(s.id));
  }, [selectedSlot, slotsMap, baseAvailableStaff]);

  // Reset state when drawer opens or service/branch changes
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setDate("");
      setSlotsMap({});
      setSelectedSlot("");
      setSelectedStaff("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerWhatsapp("");
      setNotes("");
      setError("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, service, branch]);

  // Reactive slot fetching (triggered when Date is selected)
  useEffect(() => {
    async function fetchSlots() {
      if (!business || !service || !date || !branch) {
        setSlotsMap({});
        return;
      }

      setLoadingSlots(true);
      setError("");
      setSlotsMap({});
      setSelectedSlot("");
      setSelectedStaff("");

      try {
        const available = await getAvailability({
          business_id: business.id,
          service_id: service.id,
          booking_date: date,
        });
        setSlotsMap(available);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener horarios.");
        setSlotsMap({});
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [business, service, date, branch]);

  // Automatically select staff if there's only one available for the selected slot
  useEffect(() => {
    if (open && selectedSlot && slotAvailableStaff.length === 1 && !selectedStaff) {
      setSelectedStaff(slotAvailableStaff[0].id);
    }
  }, [open, selectedSlot, slotAvailableStaff, selectedStaff]);

  const handleBook = async () => {
    if (!business || !service || !selectedStaff || !date || !selectedSlot || !branch) {
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      await createBooking({
        business_id: business.id,
        service_id: service.id,
        staff_id: selectedStaff,
        booking_date: date,
        start_time: selectedSlot,
        branch_id: branch.id,
        customer_name: customerName.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        customer_whatsapp: customerWhatsapp.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
      router.push("/dashboard"); 
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al reservar";
      setError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Group slots by time of day
  const groupedSlots = useMemo(() => {
    const groups: { label: string; slots: string[] }[] = [
      { label: "Mañana", slots: [] },
      { label: "Tarde", slots: [] },
      { label: "Noche", slots: [] },
    ];

    Object.keys(slotsMap).forEach((slot) => {
      const hour = parseInt(slot.split(":")[0], 10);
      if (hour < 12) groups[0].slots.push(slot);
      else if (hour < 18) groups[1].slots.push(slot);
      else groups[2].slots.push(slot);
    });

    return groups.filter((g) => g.slots.length > 0);
  }, [slotsMap]);

  return (
    <AnimatePresence>
      {open && service && branch && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            role="presentation"
            className="fixed inset-0 z-[100] bg-[var(--text-primary)]/10 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[100] mx-auto flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[var(--radius-2xl)] border-x border-t border-[var(--border-strong)] bg-[var(--surface-2)] shadow-[var(--shadow-lg)]"
            aria-hidden={!open}
          >
            <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-[var(--border-strong)]" />

            <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-strong)] bg-[var(--surface-2)]/90 px-6 pb-4 pt-8 backdrop-blur-md">
              <div>
                <h3 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                  Reservar {service.name}
                </h3>
                <p className="mt-0.5 text-[13.5px] text-[var(--text-secondary)]">
                  {branch.name} • {service.duration_minutes} min
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-muted)] transition-colors hover:bg-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-8 max-w-xl mx-auto">
                
                {/* 1. Seleccionar Fecha */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary)]/10 text-[12px] font-bold text-[var(--app-primary)]">1</div>
                    <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">Fecha</h4>
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
                    <input
                      type="date"
                      value={date}
                      min={minBookingDate}
                      onChange={(e) => {
                        setDate(e.target.value);
                      }}
                      className="dashboard-focusable w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] text-[14px] font-medium text-[var(--text-primary)] focus:bg-[var(--surface-1)] focus:border-[var(--app-primary)] transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Seleccionar Hora */}
                <AnimatePresence>
                  {date && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-soft)]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary)]/10 text-[12px] font-bold text-[var(--app-primary)]">2</div>
                        <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">Horario</h4>
                      </div>

                      {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)]">
                          <Loader2 className="h-6 w-6 animate-spin mb-2 text-[var(--app-primary)]" />
                          <span className="text-[13px]">Buscando horarios disponibles...</span>
                        </div>
                      ) : Object.keys(slotsMap).length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] p-6 text-center">
                          <Clock className="h-6 w-6 mx-auto mb-2 text-[var(--text-muted)] opacity-50" />
                          <p className="text-[14px] font-medium text-[var(--text-secondary)]">No hay horarios disponibles</p>
                          <p className="text-[12px] text-[var(--text-muted)] mt-1">Intenta seleccionando otra fecha.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {groupedSlots.map((group) => (
                            <div key={group.label}>
                              <h5 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 pl-1">
                                {group.label}
                              </h5>
                              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                                {group.slots.map((slot) => {
                                  const isSelected = selectedSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => {
                                        setSelectedSlot(slot);
                                        setSelectedStaff("");
                                      }}
                                      className={`py-2 px-1 rounded-lg text-[13.5px] font-medium transition-all ${
                                        isSelected
                                          ? "bg-[var(--app-primary)] text-white shadow-md scale-105 border border-transparent"
                                          : "bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                                      }`}
                                    >
                                      {slot.substring(0, 5)}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Seleccionar Profesional */}
                <AnimatePresence>
                  {selectedSlot && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-soft)]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--app-primary)]/10 text-[12px] font-bold text-[var(--app-primary)]">3</div>
                        <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">Profesional</h4>
                      </div>
                      
                      {slotAvailableStaff.length === 0 ? (
                        <p className="text-sm text-[var(--color-error)]">No hay profesionales disponibles en este horario.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {slotAvailableStaff.map((staff) => (
                            <button
                              key={staff.id}
                              onClick={() => setSelectedStaff(staff.id)}
                              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                                selectedStaff === staff.id
                                  ? "border-[var(--app-primary)] bg-[var(--app-primary)]/5 shadow-sm"
                                  : "border-[var(--border-strong)] bg-[var(--surface-3)] hover:border-[var(--text-muted)]"
                              }`}
                            >
                              <div className="h-10 w-10 mb-2 flex items-center justify-center rounded-full bg-[var(--surface-1)] text-[var(--text-primary)] font-semibold border border-[var(--border-strong)]">
                                {staff.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[13px] font-medium text-[var(--text-primary)] truncate w-full text-center">{staff.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 4. Tus Datos */}
                <AnimatePresence>
                  {selectedStaff && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-soft)]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-success)]/10 text-[12px] font-bold text-[var(--color-success)]">4</div>
                        <h4 className="text-[15px] font-semibold text-[var(--text-primary)]">Tus Datos</h4>
                      </div>

                      <div className="rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-sm)] space-y-4">
                        {/* Nombre */}
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-0.5">Nombre completo *</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Tu nombre completo"
                              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--app-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]/30 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-0.5">Correo electrónico *</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="correo@ejemplo.com"
                              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--app-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]/30 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Phone + WhatsApp row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-0.5">Teléfono</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="+57 300 000 0000"
                                className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--app-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]/30 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-0.5">WhatsApp</label>
                            <div className="relative">
                              <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-success)]" />
                              <input
                                type="tel"
                                value={customerWhatsapp}
                                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                                placeholder="+57 300 000 0000"
                                className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--color-success)] focus:outline-none focus:ring-1 focus:ring-[var(--color-success)]/30 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Observaciones */}
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] pl-0.5">Observaciones</label>
                          <div className="relative">
                            <FileText className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Información relevante para tu cita..."
                              rows={3}
                              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface-2)] text-[14px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:border-[var(--app-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--app-primary)]/30 transition-colors resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="rounded-xl border border-[var(--color-error)] bg-[var(--color-error)]/10 p-3">
                    <p className="text-[13px] text-[var(--color-error)] text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="sticky bottom-0 z-10 border-t border-[var(--border-strong)] bg-[var(--surface-2)] p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full text-center sm:text-left">
                {selectedSlot && selectedStaff && isCustomerInfoValid ? (
                  <>
                    <p className="text-[13px] text-[var(--text-secondary)]">Confirmando cita para el</p>
                    <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                      {new Date(date + "T00:00:00").toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedSlot.substring(0, 5)}
                    </p>
                  </>
                ) : (
                  <p className="text-[13px] text-[var(--text-muted)]">Completa todos los pasos para reservar</p>
                )}
              </div>
              
              <Button
                onClick={handleBook}
                disabled={!selectedSlot || !selectedStaff || !isCustomerInfoValid || bookingLoading}
                isLoading={bookingLoading}
                className="w-full sm:w-auto shadow-[var(--shadow-sm)]"
              >
                Confirmar Reserva
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
