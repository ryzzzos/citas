"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { businessAgenda } from "@/lib/api/bookings";
import { listScheduleBlocks } from "@/lib/api/scheduleBlocks";
import { listServices } from "@/lib/api/services";
import { listStaff } from "@/lib/api/staff";
import type { Booking, ScheduleBlock, Service, Staff } from "@/types";
import { useBranchContext } from "@/contexts/BranchContext";
import { DateTime } from "luxon";

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
  scheduleBlocks: ScheduleBlock[];
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
  const { activeBranch, business, isLoading: branchLoading, error: branchError } = useBranchContext();
  const businessId = business?.id || null;
  const branchId = activeBranch?.id || null;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchLoading) {
      if (branchError) {
        setError(branchError);
      } else if (!businessId) {
        setError("No se pudo identificar el negocio actual.");
      }
    }
  }, [branchLoading, branchError, businessId]);

  const bookingQuery = useMemo(() => {
    const statuses = options.filters.status === "all" ? [] : [options.filters.status];

    return {
      timezone: options.timezone,
      branch_id: branchId || undefined,
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
    branchId,
  ]);

  const fromDateStr = useMemo(() => {
    if (!options.fromAtIso) return undefined;
    return DateTime.fromISO(options.fromAtIso, { zone: options.timezone }).toISODate() ?? undefined;
  }, [options.fromAtIso, options.timezone]);

  const toDateStr = useMemo(() => {
    if (!options.toAtIso) return undefined;
    return DateTime.fromISO(options.toAtIso, { zone: options.timezone }).toISODate() ?? undefined;
  }, [options.toAtIso, options.timezone]);

  const loadAgendaData = useCallback(async () => {
    if (!businessId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [bookingsResult, blocksResult, staffResult, servicesResult] = await Promise.all([
        businessAgenda(businessId, bookingQuery),
        listScheduleBlocks(businessId, {
          branch_id: branchId || undefined,
          from_date: fromDateStr,
          to_date: toDateStr,
          staff_id: options.filters.staffId === "all" ? undefined : options.filters.staffId,
        }),
        listStaff(businessId, branchId || undefined),
        listServices(businessId),
      ]);

      setBookings(bookingsResult);
      setScheduleBlocks(blocksResult);
      setStaff(staffResult);
      setServices(servicesResult);
    } catch {
      setError("No se pudo cargar la agenda. Reintenta en unos segundos.");
    } finally {
      setLoading(false);
    }
  }, [businessId, bookingQuery, branchId, fromDateStr, toDateStr, options.filters.staffId]);

  useEffect(() => {
    loadAgendaData();
  }, [loadAgendaData]);

  return {
    bookings,
    scheduleBlocks,
    staff,
    services,
    businessId,
    loading,
    error,
    reload: loadAgendaData,
  };
}

