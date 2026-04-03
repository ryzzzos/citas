"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getBusiness, listServices, listStaff, getAvailability, createBooking } from "@/lib/api";
import type { Business, Service, Staff } from "@/types";
import Button from "@/components/ui/Button";

function ServiceThumbnail({ service }: { service: Service }) {
  const [imageError, setImageError] = useState(false);

  if (!service.image_url || imageError) {
    return (
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
        aria-label={service.image_url ? "No se pudo cargar la imagen del servicio" : "Servicio sin imagen"}
      >
        Sin imagen
      </div>
    );
  }

  return (
    <img
      src={service.image_url}
      alt={`Imagen del servicio ${service.name}`}
      className="h-16 w-16 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
}

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [biz, svcs, sf] = await Promise.all([
          getBusiness(id),
          listServices(id, { includeInactive: false }),
          listStaff(id),
        ]);
        setBusiness(biz);
        setServices(svcs);
        setStaff(sf);

        const serviceFromQuery = searchParams.get("service");
        if (serviceFromQuery) {
          const serviceExists = svcs.some((service) => service.id === serviceFromQuery);
          if (serviceExists) {
            setSelectedService(serviceFromQuery);
          } else {
            setBookingError(
              "El servicio solicitado no esta disponible para reserva. Selecciona otro servicio activo."
            );
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, searchParams]);

  async function loadSlots() {
    if (!selectedService || !selectedStaff || !date) return;
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot("");
    try {
      const available = await getAvailability({
        business_id: id,
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
    if (!selectedService || !selectedStaff || !date || !selectedSlot) return;
    setBookingError("");
    setBookingLoading(true);
    try {
      await createBooking({
        business_id: id,
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
          "Este servicio ya no esta activo. Vuelve al catalogo para elegir uno disponible."
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!business) return <p className="p-8 text-center text-zinc-400">Negocio no encontrado.</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* Business header */}
      <div className="mb-8">
        <span className="mb-2 inline-block rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {business.category}
        </span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{business.name}</h1>
        <p className="mt-1 text-zinc-500">{business.city} · {business.address}</p>
        {business.description && (
          <p className="mt-3 text-sm text-zinc-500">{business.description}</p>
        )}
      </div>

      {/* Services */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">Servicios</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <ServiceThumbnail service={s} />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{s.name}</p>
                  <p className="text-sm text-zinc-500">{s.duration_minutes} min · ${s.price}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Booking form */}
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Reservar cita
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Servicio</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Selecciona un servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.duration_minutes} min
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Profesional
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">Selecciona un profesional</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Fecha</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <Button
            variant="secondary"
            onClick={loadSlots}
            isLoading={slotsLoading}
            disabled={!selectedService || !selectedStaff || !date}
          >
            Ver horarios disponibles
          </Button>

          {slots.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Horario
              </label>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      selectedSlot === slot
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700"
                    }`}
                  >
                    {slot.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {slots.length === 0 && !slotsLoading && selectedService && selectedStaff && date && (
            <p className="text-sm text-zinc-400">No hay horarios disponibles para esa fecha.</p>
          )}

          {bookingError ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200">
              <p>{bookingError}</p>
              <Link href="/marketplace" className="mt-2 inline-flex underline underline-offset-4">
                Volver al marketplace
              </Link>
            </div>
          ) : null}

          <Button
            onClick={handleBook}
            isLoading={bookingLoading}
            disabled={!selectedSlot}
            className="w-full"
          >
            Confirmar reserva
          </Button>
        </div>
      </section>
    </main>
  );
}
