"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import BusinessProfileView from "@/components/business-profile/BusinessProfileView";
import StickyBranchSelector from "@/components/public-profile/StickyBranchSelector";
import LocationPickerDrawer from "@/components/public-profile/LocationPickerDrawer";
import Button from "@/components/ui/Button";
import { createBooking, getAvailability, getBusinessBySlug, listServices, listStaff, getServiceCategories } from "@/lib/api";
import { listBranches } from "@/lib/api/branches";
import type { Business, Service, Staff, ServiceCategory, Branch } from "@/types";

export default function PublicBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shakeBadge, setShakeBadge] = useState(false);

  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const minBookingDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const selectedBranch = useMemo(() => {
    return branches.find((b) => b.id === selectedBranchId) || undefined;
  }, [branches, selectedBranchId]);

  const displayServices = useMemo(() => {
    if (!selectedBranchId) return services;
    
    // Find staff that belongs to the selected branch
    const branchStaff = staff.filter((s) => s.branch_id === selectedBranchId);
    
    // Extract unique service IDs that these staff members provide
    const branchServiceIds = new Set<string>();
    branchStaff.forEach((member) => {
      member.service_ids?.forEach((id) => branchServiceIds.add(id));
    });
    
    // Filter the global services list to only those provided at this branch
    return services.filter((service) => branchServiceIds.has(service.id));
  }, [services, staff, selectedBranchId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const biz = await getBusinessBySlug(slug);
        const [brs, svcs, cats, sf] = await Promise.all([
          listBranches(biz.id),
          listServices(biz.id, { includeInactive: false }),
          getServiceCategories(biz.id),
          listStaff(biz.id),
        ]);

        setBusiness(biz);
        setBranches(brs.filter(b => b.is_active));
        setServices(svcs);
        setCategories(cats);
        setStaff(sf);
      } catch {
        setBusiness(null);
        setBranches([]);
        setServices([]);
        setCategories([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  useEffect(() => {
    const branchFromQuery = searchParams.get("branch");
    if (branchFromQuery && branches.some((b) => b.id === branchFromQuery)) {
      setSelectedBranchId(branchFromQuery);
    }
  }, [searchParams, branches]);

  useEffect(() => {
    const serviceFromQuery = searchParams.get("service");
    if (!serviceFromQuery) {
      return;
    }

    const serviceExists = services.some((service) => service.id === serviceFromQuery);
    if (serviceExists) {
      setSelectedService(serviceFromQuery);
      setBookingError("");
      return;
    }

    setBookingError(
      "El servicio solicitado no esta disponible para reserva. Selecciona otro servicio activo."
    );
  }, [searchParams, services]);

  function handleServiceSelect(serviceId: string) {
    if (branches.length > 0 && !selectedBranchId) {
      setShakeBadge(true);
      setTimeout(() => {
        setShakeBadge(false);
        setIsDrawerOpen(true);
      }, 600);
      return;
    }
    
    setSelectedService(serviceId);
    setBookingError("");
    
    setTimeout(() => {
      document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function loadSlots() {
    if (!business || !selectedService || !selectedStaff || !date) {
      return;
    }

    if (!selectedBranchId) {
      setShakeBadge(true);
      setTimeout(() => {
        setShakeBadge(false);
        setIsDrawerOpen(true);
      }, 600);
      return;
    }

    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot("");

    try {
      const available = await getAvailability({
        business_id: business.id,
        staff_id: selectedStaff,
        service_id: selectedService,
        booking_date: date,
      });
      setSlots(available);
    } finally {
      setSlotsLoading(false);
    }
  }

  async function handleBook() {
    if (!business || !selectedService || !selectedStaff || !date || !selectedSlot || !selectedBranchId) {
      return;
    }

    setBookingError("");
    setBookingLoading(true);

    try {
      await createBooking({
        business_id: business.id,
        service_id: selectedService,
        staff_id: selectedStaff,
        booking_date: date,
        start_time: selectedSlot,
        branch_id: selectedBranchId,
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al reservar";
      if (message.includes("Service not found")) {
        setBookingError(
          "Este servicio ya no esta activo. Vuelve a sucursales para elegir uno disponible."
        );
      } else {
        setBookingError(message);
      }
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--app-primary)] dark:border-[var(--border-strong)] dark:border-t-[var(--app-primary)]" />
      </div>
    );
  }

  if (!business) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Negocio no encontrado</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Revisa el enlace o explora otras opciones en el mapa de sucursales.
        </p>
        <Link
          href="/sucursales"
          className="dashboard-focusable mt-5 inline-flex min-h-11 items-center rounded-full border border-[var(--border-strong)] px-4 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] dark:border-[var(--border-strong)] dark:hover:bg-[var(--surface-2)]"
        >
          Ir a sucursales
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:py-10">
      <StickyBranchSelector 
        branches={branches}
        selectedBranchId={selectedBranchId}
        onClick={() => setIsDrawerOpen(true)}
        pulse={shakeBadge}
      />

      <BusinessProfileView business={business} services={displayServices} categories={categories} branch={selectedBranch} mode="public" onServiceSelect={handleServiceSelect} />

      <section
        id="reserva"
        className="mt-6 rounded-[1.8rem] border border-[var(--border-strong)] bg-[var(--surface-3)] p-4 shadow-[var(--shadow-lg)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)] sm:p-6"
      >
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] ">
            Reserva online
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Confirma tu cita
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Selecciona servicio, profesional y horario disponible para finalizar la reserva.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-service" className="text-sm font-medium text-[var(--text-secondary)] ">
              Servicio
            </label>
            <select
              id="booking-service"
              value={selectedService}
              onChange={(event) => {
                setSelectedService(event.target.value);
                setSelectedSlot("");
                setBookingError("");
              }}
               className="dashboard-focusable min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]"
            >
              <option value="">Selecciona un servicio</option>
              {(() => {
                const grouped = categories.map((cat) => ({
                  ...cat,
                  services: displayServices.filter((s) => s.service_category_id === cat.id),
                })).filter((cat) => cat.services.length > 0);
                
                const uncategorized = displayServices.filter(
                  (s) => !s.service_category_id || !categories.some((c) => c.id === s.service_category_id)
                );
                
                return (
                  <>
                    {grouped.map((cat) => (
                      <optgroup key={cat.id} label={cat.name}>
                        {cat.services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.duration_minutes} min
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    {uncategorized.length > 0 && (
                      <optgroup label="Otros servicios">
                        {uncategorized.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.duration_minutes} min
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-staff" className="text-sm font-medium text-[var(--text-secondary)] ">
              Profesional
            </label>
            <select
              id="booking-staff"
              value={selectedStaff}
              onChange={(event) => {
                setSelectedStaff(event.target.value);
                setSelectedSlot("");
              }}
               className="dashboard-focusable min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]"
            >
              <option value="">Selecciona un profesional</option>
              {staff
                .filter(member => !selectedBranchId || member.branch_id === selectedBranchId)
                .filter(member => !selectedService || member.service_ids?.some(id => id === selectedService))
                .map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label htmlFor="booking-date" className="text-sm font-medium text-[var(--text-secondary)] ">
              Fecha
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={minBookingDate}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedSlot("");
              }}
               className="dashboard-focusable min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-3)] px-3 py-2 text-sm text-[var(--text-primary)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-1)]"
            />
          </div>
        </div>

        {date && selectedService && selectedStaff && (
          <div className="mt-5 sm:mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={loadSlots}
              disabled={slotsLoading}
              className="w-full rounded-xl sm:w-auto"
            >
              {slotsLoading ? "Buscando horarios..." : "Buscar horarios"}
            </Button>
          </div>
        )}

        {slots.length > 0 && (
          <div className="mt-5 sm:mt-6">
            <label className="mb-3 block text-sm font-medium text-[var(--text-secondary)] ">
              Horarios disponibles
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`dashboard-focusable flex min-h-11 items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                    selectedSlot === slot
                      ? "border-transparent bg-[var(--app-primary)] text-white shadow-[var(--shadow-md)]"
                      : "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:bg-[var(--surface-1)] dark:border-[var(--border-strong)] dark:bg-[var(--surface-2)] dark:hover:bg-[var(--surface-1)]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {bookingError && (
          <div className="mt-5 rounded-xl border border-[var(--color-error)] bg-[var(--color-error)]/10 p-4">
            <p className="text-sm text-[var(--color-error)]">{bookingError}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row-reverse sm:items-center sm:justify-between">
          <Button
            type="button"
            onClick={handleBook}
            disabled={!selectedSlot || bookingLoading}
            className="w-full rounded-xl sm:w-auto"
          >
            {bookingLoading ? "Confirmando..." : "Confirmar reserva"}
          </Button>

          {selectedSlot && (
            <p className="text-center text-sm font-medium text-[var(--text-secondary)] sm:text-left">
              Tu cita sera el {new Date(date).toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })} a las {selectedSlot}
            </p>
          )}
        </div>
      </section>

      {business && branches.length > 0 && (
        <LocationPickerDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelect={(id) => {
            setSelectedBranchId(id);
            // Si cambian de sucursal, es mejor resetear las selecciones 
            // ya que el personal y los servicios disponibles pueden cambiar.
            setSelectedStaff("");
            setSelectedService("");
            setSelectedSlot("");
            setSlots([]);
          }}
        />
      )}
    </main>
  );
}
