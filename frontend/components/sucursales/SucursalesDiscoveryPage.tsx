"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import SucursalesDetailSheet from "@/components/sucursales/SucursalesDetailSheet";
import SucursalesFiltersPanel from "@/components/sucursales/SucursalesFiltersPanel";
import type { DiscoveryFilters, UserLocation, ViewportState } from "@/components/sucursales/types";
import { listBusinessesMap } from "@/lib/api";
import { cn, glassRecipes } from "@/lib/utils";
import type { BusinessMapPoint } from "@/types";

const SucursalesMapCanvas = dynamic(
  () => import("@/components/sucursales/SucursalesMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_14%_10%,rgba(20,184,166,0.18),transparent_44%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.18),transparent_42%),linear-gradient(180deg,rgba(241,245,249,0.92),rgba(226,232,240,0.74))] text-sm text-zinc-600 dark:bg-[radial-gradient(circle_at_14%_10%,rgba(20,184,166,0.2),transparent_44%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.14),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.8),rgba(2,6,23,0.66))] dark:text-zinc-300">
        <div className={cn(glassRecipes.surfaceSoft, "rounded-2xl px-4 py-3 font-medium")}>Cargando mapa...</div>
      </div>
    ),
  }
);

const DEFAULT_VIEWPORT: ViewportState = {
  north: 6.39,
  south: 6.12,
  east: -75.49,
  west: -75.68,
  zoom: 12,
};

const DEFAULT_FILTERS: DiscoveryFilters = {
  city: "",
  category: "",
};

const FETCH_DEBOUNCE_MS = 320;
const FETCH_LIMIT = 220;
const GEOLOCATION_LAT_DELTA = 0.09;
const GEOLOCATION_LNG_DELTA = 0.12;
const GEOLOCATION_TARGET_ZOOM = 13;

function clampLatitude(value: number): number {
  return Math.max(-85, Math.min(85, value));
}

function normalizeLongitude(value: number): number {
  if (value < -180) {
    return value + 360;
  }
  if (value > 180) {
    return value - 360;
  }
  return value;
}

function viewportFromLocation(location: UserLocation): ViewportState {
  return {
    north: clampLatitude(location.latitude + GEOLOCATION_LAT_DELTA),
    south: clampLatitude(location.latitude - GEOLOCATION_LAT_DELTA),
    east: normalizeLongitude(location.longitude + GEOLOCATION_LNG_DELTA),
    west: normalizeLongitude(location.longitude - GEOLOCATION_LNG_DELTA),
    zoom: GEOLOCATION_TARGET_ZOOM,
  };
}

export default function SucursalesDiscoveryPage() {
  const [viewport, setViewport] = useState<ViewportState>(DEFAULT_VIEWPORT);
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_FILTERS);
  const [items, setItems] = useState<BusinessMapPoint[]>([]);
  const [viewportItems, setViewportItems] = useState<BusinessMapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [detailDismissed, setDetailDismissed] = useState(false);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const total = items.length;

  const requestSequence = useRef(0);

  const requestUserLocation = useCallback((manualRequest: boolean) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationError("Tu navegador no soporta geolocalizacion.");
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setLocationError("La geolocalizacion requiere HTTPS o localhost.");
      return;
    }

    setRequestingLocation(true);
    if (manualRequest) {
      setLocationError(null);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(nextLocation);
        setViewport(viewportFromLocation(nextLocation));
        setLocationError(null);
        setRequestingLocation(false);
      },
      (geoError) => {
        const messageByCode: Record<number, string> = {
          1: "Permiso de ubicacion denegado. Activalo en el navegador para centrar el mapa en tu ciudad.",
          2: "No pudimos determinar tu ubicacion actual.",
          3: "La solicitud de ubicacion expiro. Intenta nuevamente.",
        };

        setLocationError(messageByCode[geoError.code] ?? "No fue posible obtener tu ubicacion.");
        setRequestingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  const handleManualLocationRequest = useCallback(() => {
    requestUserLocation(true);
  }, [requestUserLocation]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!("geolocation" in navigator)) {
      return;
    }

    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setLocationError("La geolocalizacion requiere HTTPS o localhost.");
      return;
    }

    let cancelled = false;

    if (!navigator.permissions?.query) {
      requestUserLocation(false);
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((permission) => {
        if (cancelled) {
          return;
        }

        if (permission.state === "denied") {
          setLocationError("Activa el permiso de ubicacion del navegador para centrar el mapa en tu ciudad.");
          return;
        }

        requestUserLocation(false);
      })
      .catch(() => {
        if (!cancelled) {
          requestUserLocation(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestUserLocation]);

  useEffect(() => {
    const requestId = requestSequence.current + 1;
    requestSequence.current = requestId;

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const payload = await listBusinessesMap({
          north: viewport.north,
          south: viewport.south,
          east: viewport.east,
          west: viewport.west,
          city: filters.city.trim() || undefined,
          category: filters.category.trim() || undefined,
          limit: FETCH_LIMIT,
          offset: 0,
        });

        if (requestId !== requestSequence.current) {
          return;
        }

        setViewportItems(payload.items);
        setItems((current) => {
          const mergedById = new Map<string, BusinessMapPoint>(
            current.map((business) => [business.id, business])
          );

          for (const business of payload.items) {
            mergedById.set(business.id, business);
          }

          return Array.from(mergedById.values());
        });
        setError(null);

        setSelectedBusinessId((current) => {
          const fallbackBusinessId = payload.items[0]?.id ?? null;

          if (!fallbackBusinessId) {
            return null;
          }

          if (!current) {
            return detailDismissed ? null : fallbackBusinessId;
          }

          const stillVisible = payload.items.some((business) => business.id === current);
          if (stillVisible) {
            return current;
          }

          return detailDismissed ? null : fallbackBusinessId;
        });
      } catch (fetchError) {
        if (requestId !== requestSequence.current) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "No fue posible cargar las sucursales en el mapa.";

        setViewportItems([]);
        setError(message);
        setSelectedBusinessId(null);
      } finally {
        if (requestId === requestSequence.current) {
          setLoading(false);
        }
      }
    }, FETCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [detailDismissed, filters.category, filters.city, viewport.east, viewport.north, viewport.south, viewport.west]);

  useEffect(() => {
    if (viewportItems.length === 0) {
      return;
    }

    if (detailDismissed) {
      return;
    }

    if (!selectedBusinessId || !viewportItems.some((business) => business.id === selectedBusinessId)) {
      setSelectedBusinessId(viewportItems[0].id);
    }
  }, [detailDismissed, selectedBusinessId, viewportItems]);

  const selectedBusiness = useMemo(() => {
    if (selectedBusinessId) {
      const selectedFromCache = items.find((business) => business.id === selectedBusinessId);
      if (selectedFromCache) {
        return selectedFromCache;
      }
    }

    if (detailDismissed) {
      return null;
    }

    return viewportItems[0] ?? null;
  }, [detailDismissed, items, selectedBusinessId, viewportItems]);

  return (
    <main className="relative h-[100dvh] min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_16%_8%,rgba(20,184,166,0.12),transparent_46%),radial-gradient(circle_at_90%_2%,rgba(56,189,248,0.1),transparent_40%),linear-gradient(180deg,rgba(248,250,252,0.62),rgba(226,232,240,0.26))] dark:bg-[radial-gradient(circle_at_16%_8%,rgba(20,184,166,0.16),transparent_48%),radial-gradient(circle_at_90%_2%,rgba(56,189,248,0.1),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.46),rgba(2,6,23,0.16))]">
      <section className="absolute inset-0">
        <SucursalesMapCanvas
          businesses={items}
          viewport={viewport}
          selectedBusinessId={selectedBusinessId}
          focusBusiness={selectedBusiness}
          userLocation={userLocation}
          onViewportChange={setViewport}
          onSelectBusiness={(businessId) => {
            setSelectedBusinessId(businessId);
            setDetailDismissed(false);
          }}
        />
      </section>

      <section className="pointer-events-none relative z-[420] h-full">
        <SucursalesFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          items={items}
          viewportItems={viewportItems}
          total={total}
          loading={loading}
          error={error}
          selectedBusinessId={selectedBusinessId}
          onSelectBusiness={(businessId) => {
            setSelectedBusinessId(businessId);
            setDetailDismissed(false);
            setFiltersOpenMobile(false);
          }}
          requestingLocation={requestingLocation}
          hasUserLocation={Boolean(userLocation)}
          locationError={locationError}
          onRequestUserLocation={handleManualLocationRequest}
          mobileOpen={filtersOpenMobile}
          onMobileOpenChange={setFiltersOpenMobile}
        />
      </section>

      <SucursalesDetailSheet
        business={selectedBusiness}
        onClose={() => {
          setSelectedBusinessId(null);
          setDetailDismissed(true);
        }}
      />
    </main>
  );
}
