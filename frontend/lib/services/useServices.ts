"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createService,
  deleteService,
  getMyBusiness,
  listServices,
  toggleServiceActive,
  uploadServiceImage,
  updateService,
} from "@/lib/api";
import type { CreateServiceInput, Service, UpdateServiceInput } from "@/types";

export type ServiceStatusFilter = "all" | "active" | "inactive";

export interface ServicesFiltersState {
  query: string;
  status: ServiceStatusFilter;
}

const DEFAULT_FILTERS: ServicesFiltersState = {
  query: "",
  status: "all",
};

function sortByName(services: Service[]): Service[] {
  return [...services].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function useServices() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<ServicesFiltersState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const business = await getMyBusiness();
      const rows = await listServices(business.id, { includeInactive: true });
      setBusinessId(business.id);
      setServices(sortByName(rows));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los servicios.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredServices = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesQuery = query.length === 0 || service.name.toLowerCase().includes(query);
      const matchesStatus =
        filters.status === "all"
          ? true
          : filters.status === "active"
            ? service.is_active
            : !service.is_active;

      return matchesQuery && matchesStatus;
    });
  }, [filters.query, filters.status, services]);

  const create = useCallback(
    async (data: CreateServiceInput) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }

      setSaving(true);
      try {
        const created = await createService(businessId, data);
        setServices((previous) => sortByName([...previous, created]));
        return created;
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const update = useCallback(
    async (serviceId: string, data: UpdateServiceInput) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }

      setSaving(true);
      try {
        const updated = await updateService(businessId, serviceId, data);
        setServices((previous) =>
          sortByName(previous.map((row) => (row.id === updated.id ? updated : row)))
        );
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const remove = useCallback(
    async (serviceId: string) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }

      setSaving(true);
      try {
        await deleteService(businessId, serviceId);
        setServices((previous) => previous.filter((row) => row.id !== serviceId));
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const toggle = useCallback(
    async (serviceId: string, nextIsActive: boolean) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }

      setSaving(true);
      try {
        const updated = await toggleServiceActive(businessId, serviceId, nextIsActive);
        setServices((previous) =>
          sortByName(previous.map((row) => (row.id === updated.id ? updated : row)))
        );
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }

      return uploadServiceImage(businessId, file);
    },
    [businessId]
  );

  return {
    services,
    filteredServices,
    filters,
    setFilters,
    loading,
    error,
    saving,
    reload: load,
    create,
    update,
    remove,
    toggle,
    uploadImage,
  };
}
