"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";

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
    moveend: emitViewport,
    zoomend: emitViewport,
  });

  function emitViewport() {
    const bounds = map.getBounds();
    onViewportChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
    });
  }

  useEffect(() => {
    const bounds = map.getBounds();
    onViewportChange({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom(),
    });
  }, [map, onViewportChange]);

  return null;
}

function FocusBusinessController({
  focusBusiness,
}: {
  focusBusiness: BusinessMapPoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!focusBusiness) {
      return;
    }

    map.flyTo([focusBusiness.latitude, focusBusiness.longitude], Math.max(map.getZoom(), 14), {
      duration: 0.35,
    });
  }, [focusBusiness, map]);

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

export default function SucursalesMapCanvas({
  businesses,
  viewport,
  selectedBusinessId,
  focusBusiness,
  userLocation,
  onSelectBusiness,
  onViewportChange,
}: SucursalesMapCanvasProps) {
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={3}
      maxZoom={22}
      zoomControl
      className="h-full w-full"
    >
      <TileLayer
        key={tileUrl}
        url={tileUrl}
        maxNativeZoom={19}
        maxZoom={22}
        keepBuffer={8}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <ViewportReporter onViewportChange={onViewportChange} />
      <FocusBusinessController focusBusiness={focusBusiness} />
      <UserLocationController userLocation={userLocation} />

      {userLocation ? (
        <CircleMarker
          center={[userLocation.latitude, userLocation.longitude]}
          radius={8}
          pathOptions={{
            color: "#0f172a",
            weight: 2,
            fillColor: "#f8fafc",
            fillOpacity: 0.95,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            Tu ubicacion
          </Tooltip>
        </CircleMarker>
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
