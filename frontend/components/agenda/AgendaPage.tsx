"use client";

import { useMemo, useState } from "react";
import { DateTime } from "luxon";

import AgendaFiltersBar from "@/components/agenda/AgendaFiltersBar";
import AgendaHeader from "@/components/agenda/AgendaHeader";
import AgendaRightRail from "@/components/agenda/AgendaRightRail";
import { AgendaEmptyState, AgendaErrorState, AgendaLoadingState } from "@/components/agenda/AgendaStates";
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
import { updateBookingStatus } from "@/lib/api/bookings";

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
  const timezone = getCanonicalTimezone();
  const [view, setView] = useState<AgendaView>("week");
  const [filters, setFilters] = useState<AgendaFilters>(DEFAULT_FILTERS);
  const [anchorDate, setAnchorDate] = useState(() => getNowInTimezone(timezone));

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

  async function handleStatusUpdate(bookingId: string, status: "confirmed" | "cancelled") {
    try {
      await updateBookingStatus(bookingId, status);
      await reload();
    } catch {
      // Keep optimistic UX simple while preserving explicit error state from reload.
    }
  }

  function handleReschedule() {
    // Reserved for modal/flow integration without changing timeline architecture.
  }

  if (loading) {
    return <AgendaLoadingState />;
  }

  if (error) {
    return <AgendaErrorState message={error} onRetry={reload} />;
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

      <AgendaFiltersBar filters={filters} staff={staff} services={services} onFiltersChange={setFilters} />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <AgendaTimeline
              columns={columns}
              bookingsByDay={bookingsByDay}
              timelineSlots={timelineSlots}
              onConfirm={(bookingId) => handleStatusUpdate(bookingId, "confirmed")}
              onCancel={(bookingId) => handleStatusUpdate(bookingId, "cancelled")}
              onReschedule={handleReschedule}
            />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto pr-1">
          <AgendaRightRail
            total={enrichedBookings.length}
            pending={enrichedBookings.filter((booking) => booking.status === "pending").length}
            confirmed={enrichedBookings.filter((booking) => booking.status === "confirmed").length}
            nextBookings={nextBookings}
          />
        </div>
      </div>
    </div>
  );
}
