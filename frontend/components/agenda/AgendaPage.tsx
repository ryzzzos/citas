"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sileo } from "sileo";
import { DateTime } from "luxon";

// import AgendaFiltersBar from "@/components/agenda/AgendaFiltersBar";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import AgendaHorizontalDays from "@/components/agenda/AgendaHorizontalDays";
import AgendaRightRail from "@/components/agenda/AgendaRightRail";
import { AgendaErrorState, AgendaLoadingState } from "@/components/agenda/AgendaStates";
import AgendaTimeline from "@/components/agenda/AgendaTimeline";
import {
  formatViewLabel,
  getAgendaDayColumns,
  getCanonicalTimezone,
  getNowInTimezone,
  getTimelineSlots,
  getViewRange,
  shiftAnchorDate,
  toAgendaBooking,
} from "@/lib/agenda/calendar";
import type { AgendaBooking, AgendaFilters, AgendaView } from "@/lib/agenda/types";
import { useAgendaData } from "@/lib/agenda/useAgendaData";
import { updateBookingStatus, registerBookingPayment, rescheduleBooking } from "@/lib/api/bookings";
import type { PaymentMethod } from "@/lib/api/bookings";
import { useBranchContext } from "@/contexts/BranchContext";

const DEFAULT_FILTERS: AgendaFilters = {
  status: "all",
  staffId: "all",
  serviceId: "all",
  query: "",
};

function mapBookingsByDay(bookings: AgendaBooking[]): Record<string, AgendaBooking[]> {
  return bookings.reduce<Record<string, AgendaBooking[]>>((accumulator, booking) => {
    const dateKey = booking.startAt.toISODate() ?? booking.booking_date;
    const current = accumulator[dateKey] ?? [];
    accumulator[dateKey] = [...current, booking];
    return accumulator;
  }, {});
}

export default function AgendaPage() {
  const { business } = useBranchContext();
  const timezone = useMemo(() => {
    return business?.timezone || getCanonicalTimezone();
  }, [business?.timezone]);

  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const initialBookingId = searchParams.get("bookingId");

  const [view, setView] = useState<AgendaView>("day");
  // const [filters, setFilters] = useState<AgendaFilters>(DEFAULT_FILTERS);
  const filters = DEFAULT_FILTERS;

  const [anchorDate, setAnchorDate] = useState(() => {
    if (dateParam) {
      const parsed = DateTime.fromISO(dateParam, { zone: timezone });
      if (parsed.isValid) {
        return parsed;
      }
    }
    return getNowInTimezone(timezone);
  });

  // Sync state during render if dateParam changes
  const [prevDateParam, setPrevDateParam] = useState<string | null>(null);
  if (dateParam !== prevDateParam) {
    setPrevDateParam(dateParam);
    if (dateParam) {
      const parsed = DateTime.fromISO(dateParam, { zone: timezone });
      if (parsed.isValid) {
        setAnchorDate(parsed);
      }
    }
  }

  // Sync state during render if timezone changes to avoid cascading effects
  const [prevTimezone, setPrevTimezone] = useState(timezone);
  if (timezone !== prevTimezone) {
    setPrevTimezone(timezone);
    setAnchorDate((prev) => prev.setZone(timezone) as DateTime);
  }

  const range = useMemo(() => getViewRange(anchorDate, view), [anchorDate, view]);

  const {
    bookings,
    staff,
    services,
    loading,
    error,
    reload,
  } = useAgendaData({
    timezone,
    fromAtIso: range.fromAt.toUTC().toISO() ?? "",
    toAtIso: range.toAt.toUTC().toISO() ?? "",
    selectedDateIso: anchorDate.toISODate() ?? "",
    view,
    filters,
  });

  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);
  const serviceById = useMemo(() => new Map(services.map((service) => [service.id, service])), [services]);

  const timelineSlots = useMemo(() => getTimelineSlots(60), []);

  const enrichedBookings = useMemo(() => {
    return bookings
      .map((booking) => toAgendaBooking(booking, timezone, staffById, serviceById))
      .filter((booking) => booking.isValidTime)
      .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
  }, [bookings, serviceById, staffById, timezone]);

  const columns = useMemo(() => getAgendaDayColumns(anchorDate, view, timezone), [anchorDate, timezone, view]);
  const bookingsByDay = useMemo(() => mapBookingsByDay(enrichedBookings), [enrichedBookings]);

  const nextBookings = useMemo(() => {
    const now = DateTime.now().setZone(timezone);
    return enrichedBookings.filter((booking) => booking.endAt >= now).slice(0, 4);
  }, [enrichedBookings, timezone]);

  async function handleStatusUpdate(
    bookingId: string,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ) {
    const statusLabel = {
      pending: "Cita puesta en pendiente",
      confirmed: "Cita confirmada con éxito",
      cancelled: "Cita cancelada con éxito",
      completed: "Cita completada con éxito",
    }[status];

    const promise = (async () => {
      await updateBookingStatus(bookingId, status);
      await reload();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("booking-updated"));
      }
    })();

    sileo.promise(promise, {
      loading: { title: "Actualizando estado de la cita..." },
      success: {
        title: statusLabel,
        description: `El estado de la cita fue cambiado a "${status === "pending" ? "pendiente" : status === "confirmed" ? "confirmada" : status === "cancelled" ? "cancelada" : "completada"}".`
      },
      error: (err) => ({
        title: "Error al actualizar estado",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo."
      }),
    });

    try {
      await promise;
    } catch {
      // Keep optimistic UX simple while preserving explicit error state from reload.
    }
  }

  async function handleReschedule(bookingId: string, bookingDate: string, startTime: string, staffId?: string) {
    const promise = (async () => {
      await rescheduleBooking(bookingId, bookingDate, startTime, staffId);
      await reload();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("booking-updated"));
      }
    })();

    sileo.promise(promise, {
      loading: { title: "Reprogramando cita..." },
      success: {
        title: "Cita reprogramada",
        description: "La cita ha sido reprogramada con éxito.",
      },
      error: (err) => ({
        title: "Error al reprogramar cita",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      }),
    });

    try {
      await promise;
    } catch {
      // Error handled by sileo toast
    }
  }


  async function handlePaymentRegister(bookingId: string, method: PaymentMethod) {
    const methodLabel = {
      cash: "Efectivo",
      credit_card: "Tarjeta",
      transfer: "Transferencia",
    }[method];

    const promise = (async () => {
      await registerBookingPayment(bookingId, method);
      await reload();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("booking-updated"));
      }
    })();

    sileo.promise(promise, {
      loading: { title: "Registrando pago..." },
      success: {
        title: "Pago registrado",
        description: `Se registró el pago vía ${methodLabel}.`,
      },
      error: (err) => ({
        title: "Error al registrar pago",
        description: err instanceof Error ? err.message : "Inténtalo de nuevo.",
      }),
    });

    try {
      await promise;
    } catch {
      // Error already displayed via sileo toast.
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:gap-5">
      <AgendaHeader
        title={formatViewLabel(anchorDate, view)}
        timezone={timezone}
        view={view}
        onViewChange={setView}
        onToday={() => setAnchorDate(getNowInTimezone(timezone))}
        onPrevious={() => setAnchorDate((previous) => shiftAnchorDate(previous, view, -1))}
        onNext={() => setAnchorDate((previous) => shiftAnchorDate(previous, view, 1))}
      />

      {/* <AgendaFiltersBar filters={filters} staff={staff} services={services} onFiltersChange={setFilters} /> */}
      <AgendaHorizontalDays anchorDate={anchorDate} onDateSelect={setAnchorDate} timezone={timezone} view={view} />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        {loading ? (
          <div className="col-span-1 flex items-center justify-center xl:col-span-2">
            <AgendaLoadingState />
          </div>
        ) : error ? (
          <div className="col-span-1 xl:col-span-2">
            <AgendaErrorState message={error} onRetry={reload} />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-col gap-4">
              <div className="min-h-0 flex-1">
                <AgendaTimeline
                  columns={columns}
                  bookingsByDay={bookingsByDay}
                  timelineSlots={timelineSlots}
                  staff={staff}
                  onConfirm={(bookingId) => handleStatusUpdate(bookingId, "confirmed")}
                  onCancel={(bookingId) => handleStatusUpdate(bookingId, "cancelled")}
                  onStatusUpdate={handleStatusUpdate}
                  onPaymentRegister={handlePaymentRegister}
                  onReschedule={handleReschedule}
                  initialBookingId={initialBookingId}
                />
              </div>
            </div>

            <div className="min-h-0 pr-1 h-full">
              <AgendaRightRail
                total={enrichedBookings.length}
                pending={enrichedBookings.filter((booking) => booking.status === "pending").length}
                confirmed={enrichedBookings.filter((booking) => booking.status === "confirmed").length}
                completed={enrichedBookings.filter((booking) => booking.status === "completed").length}
                cancelled={enrichedBookings.filter((booking) => booking.status === "cancelled").length}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
