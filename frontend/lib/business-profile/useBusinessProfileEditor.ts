"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  checkBusinessSlugAvailability,
  getMyBusiness,
  listServices,
  updateBusiness,
  uploadBusinessCoverImage,
  uploadBusinessLogoImage,
} from "@/lib/api";
import type { Business, Service, UpdateBusinessInput } from "@/types";

interface ProfileDraft {
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  whatsapp_phone: string;
  email: string;
  slug: string;
  public_bio: string;
  description: string;
}

const EMPTY_DRAFT: ProfileDraft = {
  name: "",
  category: "",
  address: "",
  city: "",
  phone: "",
  whatsapp_phone: "",
  email: "",
  slug: "",
  public_bio: "",
  description: "",
};

function toDraft(business: Business): ProfileDraft {
  return {
    name: business.name,
    category: business.category,
    address: business.address,
    city: business.city,
    phone: business.phone,
    whatsapp_phone: business.whatsapp_phone ?? "",
    email: business.email,
    slug: business.slug,
    public_bio: business.public_bio ?? "",
    description: business.description ?? "",
  };
}

function draftToPayload(draft: ProfileDraft): UpdateBusinessInput {
  return {
    name: draft.name,
    category: draft.category,
    address: draft.address,
    city: draft.city,
    phone: draft.phone,
    whatsapp_phone: draft.whatsapp_phone.trim() || null,
    email: draft.email,
    slug: draft.slug,
    public_bio: draft.public_bio.trim() || null,
    description: draft.description.trim() || null,
  };
}

export function slugifyBusinessName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function useBusinessProfileEditor() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [draft, setDraft] = useState<ProfileDraft>(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await getMyBusiness();
      const serviceRows = await listServices(profile.id, { includeInactive: true });
      setBusiness(profile);
      setDraft(toDraft(profile));
      setServices(serviceRows);
      setSlugAvailable(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar tu perfil de negocio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const previewBusiness = useMemo<Business | null>(() => {
    if (!business) {
      return null;
    }

    return {
      ...business,
      ...draftToPayload(draft),
      slug: draft.slug,
      whatsapp_phone: draft.whatsapp_phone.trim() || null,
      public_bio: draft.public_bio.trim() || null,
      description: draft.description.trim() || null,
    };
  }, [business, draft]);

  const setDraftField = useCallback(
    <K extends keyof ProfileDraft>(field: K, value: ProfileDraft[K]) => {
      setDraft((current) => ({ ...current, [field]: value }));
      if (field === "slug") {
        setSlugAvailable(null);
      }
    },
    []
  );

  const checkSlug = useCallback(async () => {
    if (!business) {
      return;
    }

    const slug = draft.slug.trim();
    if (!slug) {
      setSlugAvailable(false);
      return;
    }

    setCheckingSlug(true);
    try {
      const response = await checkBusinessSlugAvailability(slug, business.id);
      setSlugAvailable(response.available);
    } catch {
      setSlugAvailable(false);
    } finally {
      setCheckingSlug(false);
    }
  }, [business, draft.slug]);

  const saveProfile = useCallback(async () => {
    if (!business) {
      throw new Error("No se encontro un negocio para esta cuenta.");
    }

    setSaving(true);
    setError(null);
    try {
      const saved = await updateBusiness(business.id, draftToPayload(draft));
      setBusiness(saved);
      setDraft(toDraft(saved));
      setSlugAvailable(true);
      return saved;
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo guardar el perfil.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, [business, draft]);

  const uploadCover = useCallback(
    async (file: File) => {
      if (!business) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }
      const response = await uploadBusinessCoverImage(business.id, file);
      setBusiness((current) => (current ? { ...current, cover_image_url: response.image_url } : current));
      return response;
    },
    [business]
  );

  const uploadLogo = useCallback(
    async (file: File) => {
      if (!business) {
        throw new Error("No se encontro un negocio para esta cuenta.");
      }
      const response = await uploadBusinessLogoImage(business.id, file);
      setBusiness((current) => (current ? { ...current, logo_image_url: response.image_url } : current));
      return response;
    },
    [business]
  );

  const suggestSlugFromName = useCallback(() => {
    setDraft((current) => ({
      ...current,
      slug: slugifyBusinessName(current.name),
    }));
    setSlugAvailable(null);
  }, []);

  return {
    business,
    services,
    draft,
    previewBusiness,
    loading,
    saving,
    error,
    slugAvailable,
    checkingSlug,
    setDraftField,
    checkSlug,
    saveProfile,
    uploadCover,
    uploadLogo,
    suggestSlugFromName,
    reload: load,
  };
}
