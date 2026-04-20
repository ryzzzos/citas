"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import BusinessProfileView from "@/components/business-profile/BusinessProfileView";
import Button from "@/components/ui/Button";
import { createBooking, getAvailability, getBusinessBySlug, listServices, listStaff } from "@/lib/api";
import type { Business, Service, Staff } from "@/types";

export default function PublicBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const minBookingDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const biz = await getBusinessBySlug(slug);
        const [svcs, sf] = await Promise.all([
          listServices(biz.id, { includeInactive: false }),
          listStaff(biz.id),
        ]);

        setBusiness(biz);
        setServices(svcs);
        setStaff(sf);
      } catch {
        setBusiness(null);
        setServices([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

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

  async function loadSlots() {
    if (!business || !selectedService || !selectedStaff || !date) {
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
    if (!business || !selectedService || !selectedStaff || !date || !selectedSlot) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-200" />
      </div>
    );
  }

  if (!business) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Negocio no encontrado</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Revisa el enlace o explora otras opciones en el mapa de sucursales.
        </p>
        <Link
          href="/sucursales"
          className="dashboard-focusable mt-5 inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Ir a sucursales
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:py-10">
      <BusinessProfileView business={business} services={services} mode="public" />

      <section
        id="reserva"
        className="mt-6 rounded-[1.8rem] border border-zinc-200 bg-white p-4 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.55)] dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
      >
        <div className="mb-4 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            Reserva online
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Confirma tu cita
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Selecciona servicio, profesional y horario disponible para finalizar la reserva.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-service" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
              className="dashboard-focusable min-h-11 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Selecciona un servicio</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.duration_minutes} min
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-staff" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Profesional
            </label>
            <select
              id="booking-staff"
              value={selectedStaff}
              onChange={(event) => {
                setSelectedStaff(event.target.value);
                setSelectedSlot("");
              }}
              className="dashboard-focusable min-h-11 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">Selecciona un profesional</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label htmlFor="booking-date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
              className="dashboard-focusable min-h-11 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={loadSlots}
            isLoading={slotsLoading}
            disabled={!selectedService || !selectedStaff || !date}
            className="min-h-11"
          >
            Ver horarios disponibles
          </Button>
        </div>

        {slots.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Horario</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  aria-pressed={selectedSlot === slot}
                  className={`dashboard-focusable min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedSlot === slot
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                >
                  {slot.slice(0, 5)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {slots.length === 0 && !slotsLoading && selectedService && selectedStaff && date ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No hay horarios disponibles para esa fecha.
          </p>
        ) : null}

        {bookingError ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200">
            <p>{bookingError}</p>
            <Link href="/sucursales" className="dashboard-focusable mt-2 inline-flex underline underline-offset-4">
              Volver al mapa de sucursales
            </Link>
          </div>
        ) : null}

        <div className="mt-5">
          <Button
            onClick={handleBook}
            isLoading={bookingLoading}
            disabled={!selectedSlot}
            className="min-h-11 w-full"
          >
            Confirmar reserva
          </Button>
        </div>
      </section>
    </main>
  );
}
