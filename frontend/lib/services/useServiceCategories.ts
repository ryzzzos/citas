"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createServiceCategory,
  deleteServiceCategory,
  getMyBusiness,
  getServiceCategories,
  updateServiceCategory,
} from "@/lib/api";
import type {
  CreateServiceCategoryInput,
  ServiceCategory,
  UpdateServiceCategoryInput,
} from "@/types";

export function useServiceCategories() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const business = await getMyBusiness();
      const rows = await getServiceCategories(business.id);
      setBusinessId(business.id);
      setCategories(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las categorías.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (data: CreateServiceCategoryInput) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }
      setSaving(true);
      try {
        const created = await createServiceCategory(businessId, {
          ...data,
          position: data.position ?? categories.length,
        });
        setCategories((prev) => [...prev, created]);
        return created;
      } finally {
        setSaving(false);
      }
    },
    [businessId, categories.length]
  );

  const update = useCallback(
    async (categoryId: string, data: UpdateServiceCategoryInput) => {
      if (!businessId) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }
      setSaving(true);
      try {
        const updated = await updateServiceCategory(businessId, categoryId, data);
        setCategories((prev) =>
          prev.map((row) => (row.id === categoryId ? updated : row)).sort((a,b) => a.position - b.position)
        );
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const remove = useCallback(
    async (categoryId: string) => {
      if (!businessId) throw new Error("No se encontro un negocio para esta cuenta.");
      setSaving(true);
      try {
        await deleteServiceCategory(businessId, categoryId);
        setCategories((prev) => prev.filter((row) => row.id !== categoryId));
      } finally {
        setSaving(false);
      }
    },
    [businessId]
  );

  const reorder = useCallback(
    async (reorderedCategories: ServiceCategory[]) => {
      if (!businessId) return;
      // Optimistic update
      setCategories(reorderedCategories);
      setSaving(true);
      
      try {
        // Prepare to patch all them
        await Promise.all(
          reorderedCategories.map((cat, index) => {
            if (cat.position !== index) {
              return updateServiceCategory(businessId, cat.id, { position: index });
            }
            return Promise.resolve();
          })
        );
        // Reload just in case
        await load();
      } catch (err) {
        await load(); // Repaint if failed
      } finally {
        setSaving(false);
      }
    },
    [businessId, load]
  );

  return {
    businessId,
    categories,
    loading,
    error,
    saving,
    reload: load,
    create,
    update,
    remove,
    reorder
  };
}