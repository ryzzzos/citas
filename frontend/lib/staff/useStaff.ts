"use client";

import { useCallback, useEffect, useState } from "react";
import { createStaff, deleteStaff, listStaff, updateStaff, uploadStaffPhoto } from "@/lib/api/staff";
import type { Staff } from "@/types";
import { useBranchContext } from "@/contexts/BranchContext";

export function useStaff() {
  const { activeBranch, business } = useBranchContext();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!business || !activeBranch) return;

    try {
      setLoading(true);
      setError(null);
      const data = await listStaff(business.id, activeBranch.id);
      setStaff(data);
    } catch (err) {
      console.error("Failed to load staff:", err);
      setError("No se pudieron cargar los empleados.");
    } finally {
      setLoading(false);
    }
  }, [business, activeBranch]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const create = async (data: Partial<Staff>) => {
    if (!business || !activeBranch) throw new Error("No hay sucursal activa");
    
    setSaving(true);
    try {
      const newStaff = await createStaff(business.id, {
        ...data,
        branch_id: activeBranch.id,
      });
      setStaff((prev) => [...prev, newStaff]);
      return newStaff;
    } finally {
      setSaving(false);
    }
  };

  const update = async (id: string, data: Partial<Staff>) => {
    if (!business) throw new Error("No hay negocio activo");

    setSaving(true);
    try {
      const updated = await updateStaff(business.id, id, data);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (id: string, file: File) => {
    if (!business) throw new Error("No hay negocio activo");

    setSaving(true);
    try {
      const updated = await uploadStaffPhoto(business.id, id, file);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!business) throw new Error("No hay negocio activo");

    setSaving(true);
    try {
      await deleteStaff(business.id, id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return {
    staff,
    loading,
    error,
    saving,
    reload: fetchStaff,
    create,
    update,
    uploadPhoto,
    remove,
  };
}
