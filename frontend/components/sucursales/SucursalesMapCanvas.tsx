"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Plus, Minus } from "lucide-react";

import SucursalesMapMarkers from "@/components/sucursales/SucursalesMapMarkers";
import type { BusinessMapPoint } from "@/types";
import type { UserLocation, ViewportState } from "@/components/sucursales/types";

interface SucursalesMapCanvasProps {
  businesses: BusinessMapPoint[];
  viewport: ViewportState;
  selectedBusinessId: string | null;
  focusBusiness: BusinessMapPoint | null;
  userLocation: UserLocation | null;
  onSelectBusiness: (businessId: string) => void;
  onViewportChange: (nextViewport: ViewportState) => void;
}

const DEFAULT_CENTER: [number, number] = [6.2442, -75.5812];
const DEFAULT_ZOOM = 12;

function ViewportReporter({
  onViewportChange,
}: {
  onViewportChange: (nextViewport: ViewportState) => void;
}) {
  const map = useMapEvents({
    moveend: () => emitViewport(),
    zoomend: () => emitViewport(),
  });

  const emitViewport = useCallback(() => {
    const bounds = map.getBounds();
    onViewportChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
    });
  }, [map, onViewportChange]);

  useEffect(() => {
    emitViewport();
  }, [emitViewport]);

  return null;
}

function FocusBusinessController({
  focusBusiness,
}: {
  focusBusiness: BusinessMapPoint | null;
}) {
  const map = useMap();

  const id = focusBusiness?.id;
  const lat = focusBusiness?.latitude;
  const lng = focusBusiness?.longitude;

  useEffect(() => {
    if (!id || lat === undefined || lng === undefined) {
      return;
    }

    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
      duration: 0.35,
    });
  }, [id, lat, lng, map]);

  return null;
}

function UserLocationController({
  userLocation,
}: {
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    map.flyTo([userLocation.latitude, userLocation.longitude], Math.max(map.getZoom(), 13), {
      duration: 0.45,
    });
  }, [userLocation, map]);

  return null;
}

function MapZoomControls() {
  const map = useMap();

  return (
    <div className="absolute right-5 top-1/2 -translate-y-1/2 z-[400] flex flex-col gap-2 pointer-events-auto">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] hover:bg-[var(--surface-1)] active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Acercar"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-3)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] hover:bg-[var(--surface-1)] active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Alejar"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function SucursalesMapCanvas({
  businesses,
  viewport,
  selectedBusinessId,
  focusBusiness,
  userLocation,
  onSelectBusiness,
  onViewportChange,
}: SucursalesMapCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const tileUrl = "https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=PvIiQ0nO1t77BEI61zKQ";
  
  const attribution = '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const userLocationIcon = useMemo(() => {
    if (!mounted) return null;
    return L.divIcon({
      className: "bg-transparent border-none",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute w-6 h-6 bg-[var(--app-primary)] rounded-full opacity-35 animate-ping"></div>
          <div class="relative w-4 h-4 bg-[var(--app-primary)] rounded-full border-2 border-white dark:border-[var(--surface-0)] shadow-[var(--shadow-md)]"></div>
        </div>
      `,
    });
  }, [mounted]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={3}
      maxZoom={22}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key="maptiler-tile-layer"
        url={tileUrl}
        maxNativeZoom={19}
        maxZoom={22}
        keepBuffer={8}
        attribution={attribution}
      />

      <ViewportReporter onViewportChange={onViewportChange} />
      <FocusBusinessController focusBusiness={focusBusiness} />
      <UserLocationController userLocation={userLocation} />
      <MapZoomControls />

      {userLocation && userLocationIcon ? (
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={userLocationIcon}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            Tu ubicación
          </Tooltip>
        </Marker>
      ) : null}

      <SucursalesMapMarkers
        businesses={businesses}
        viewport={viewport}
        selectedBusinessId={selectedBusinessId}
        onSelectBusiness={onSelectBusiness}
      />
    </MapContainer>
  );
}
