"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getMyBusiness } from "@/lib/api/businesses";
import { businessAgenda } from "@/lib/api/bookings";
import { listServices } from "@/lib/api/services";
import { listStaff } from "@/lib/api/staff";
import type { Booking, Service, Staff } from "@/types";

import type { AgendaFilters, AgendaView } from "./types";

export interface UseAgendaDataOptions {
  timezone: string;
  fromAtIso: string;
  toAtIso: string;
  selectedDateIso: string;
  view: AgendaView;
  filters: AgendaFilters;
}

interface UseAgendaDataState {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
  businessId: string | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

function normalizeQuery(value: string): string {
  return value.trim();
}

export function useAgendaData(options: UseAgendaDataOptions): UseAgendaDataState {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBusiness() {
      try {
        const business = await getMyBusiness();
        if (!cancelled) {
          setBusinessId(business.id);
        }
      } catch {
        if (!cancelled) {
          setLoading(false);
          setError("No se pudo identificar el negocio actual.");
        }
      }
    }

    loadBusiness();

    return () => {
      cancelled = true;
    };
  }, []);

  const bookingQuery = useMemo(() => {
    const statuses = options.filters.status === "all" ? [] : [options.filters.status];

    return {
      timezone: options.timezone,
      from_at: options.fromAtIso,
      to_at: options.toAtIso,
      booking_date: options.view === "day" ? options.selectedDateIso : undefined,
      statuses,
      staff_id: options.filters.staffId === "all" ? undefined : options.filters.staffId,
      service_id: options.filters.serviceId === "all" ? undefined : options.filters.serviceId,
      q: normalizeQuery(options.filters.query) || undefined,
    };
  }, [
    options.filters.query,
    options.filters.serviceId,
    options.filters.staffId,
    options.filters.status,
    options.fromAtIso,
    options.selectedDateIso,
    options.timezone,
    options.toAtIso,
    options.view,
  ]);

  const loadAgendaData = useCallback(async () => {
    if (!businessId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [bookingsResult, staffResult, servicesResult] = await Promise.all([
        businessAgenda(businessId, bookingQuery),
        listStaff(businessId),
        listServices(businessId),
      ]);

      setBookings(bookingsResult);
      setStaff(staffResult);
      setServices(servicesResult);
    } catch {
      setError("No se pudo cargar la agenda. Reintenta en unos segundos.");
    } finally {
      setLoading(false);
    }
  }, [bookingQuery, businessId]);

  useEffect(() => {
    loadAgendaData();
  }, [loadAgendaData]);

  return {
    bookings,
    staff,
    services,
    businessId,
    loading,
    error,
    reload: loadAgendaData,
  };
}
