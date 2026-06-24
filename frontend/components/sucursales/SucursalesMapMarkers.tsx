"use client";

import { useMemo, useCallback, memo } from "react";
import L from "leaflet";
import Supercluster from "supercluster";
import { Marker, useMap } from "react-leaflet";

import type { BusinessMapPoint } from "@/types";
import type { ViewportState } from "@/components/sucursales/types";

interface SucursalesMapMarkersProps {
  businesses: BusinessMapPoint[];
  viewport: ViewportState;
  selectedBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
}

type BusinessFeatureProps = {
  businessId: string;
};

type ClusterProperties = {
  cluster: true;
  cluster_id: number;
  point_count: number;
};

const ICONS_SVG: Record<string, string> = {
  barberia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="9.8" y1="8.2" x2="20" y2="18.4"/><line x1="9.8" y1="15.8" x2="20" y2="5.6"/></svg>`,
  spa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 3.6-1 8a7 7 0 0 1-7 10Z"/></svg>`,
  "salon de belleza": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  kinesiologia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0"><path d="m2 9 3-5h14l3 5v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M9 12v6M15 12v6"/></svg>`,
};

function getCategoryIcon(category: string, selected: boolean): string {
  const norm = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const iconColor = selected ? "text-white" : "text-[var(--app-primary)]";
  
  let svg = ICONS_SVG.default;
  if (norm.includes("barber")) svg = ICONS_SVG.barberia;
  else if (norm.includes("spa")) svg = ICONS_SVG.spa;
  else if (norm.includes("belleza") || norm.includes("estetica") || norm.includes("peluquer")) svg = ICONS_SVG["salon de belleza"];
  else if (norm.includes("kine") || norm.includes("salud") || norm.includes("fisioter")) svg = ICONS_SVG.kinesiologia;

  return svg.replace('class="w-3.5 h-3.5 shrink-0"', `class="w-3.5 h-3.5 shrink-0 ${iconColor}"`);
}

function getShortName(fullName: string): string {
  const words = fullName.split(" ").filter(Boolean);
  if (words.length === 0) return "Sucursal";
  const firstWord = words[0];
  if (firstWord.length >= 10 || words.length === 1) {
    return firstWord;
  }
  const combined = `${words[0]} ${words[1]}`;
  if (combined.length <= 15) {
    return combined;
  }
  return firstWord;
}

function createPinIcon(business: BusinessMapPoint | undefined, selected: boolean): L.DivIcon {
  const name = business?.name ?? "Sucursal";
  const category = business?.category ?? "default";
  
  const shortName = getShortName(name);
  const iconSvg = getCategoryIcon(category, selected);

  const bgClass = selected
    ? "bg-[var(--app-primary)] text-white"
    : "bg-[var(--surface-3)] text-[var(--text-primary)]";
    
  const ringClass = selected
    ? "ring-[3px] ring-[var(--app-primary)]/20 shadow-[var(--shadow-md)] z-50 scale-105"
    : "border border-[var(--border-strong)] shadow-[var(--shadow-sm)]";
    
  const arrowColor = selected
    ? "border-t-[var(--app-primary)]"
    : "border-t-[var(--surface-3)]";

  return L.divIcon({
    className: "bg-transparent border-none",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `
      <div class="absolute -translate-x-1/2 -translate-y-full flex items-center justify-center pointer-events-auto">
        <div class="relative flex items-center gap-1.5 whitespace-nowrap rounded-full ${bgClass} ${ringClass} px-3 py-1.5 text-[0.8rem] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-md)] cursor-pointer">
          ${iconSvg}
          <span class="font-bold tracking-tight">${shortName}</span>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent ${arrowColor}"></div>
        </div>
      </div>
    `,
  });
}

function createClusterIcon(count: number): L.DivIcon {
  const size = count >= 100 ? 52 : count >= 20 ? 46 : 40;
  return L.divIcon({
    className: "bg-transparent border-none",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div class="relative flex items-center justify-center w-full h-full">
        <!-- Outer soft glow ring -->
        <div class="absolute inset-0 bg-[var(--app-primary)]/15 rounded-full scale-125 animate-pulse"></div>
        <!-- Inner container -->
        <div class="relative flex items-center justify-center w-[85%] h-[85%] bg-[var(--app-primary)] text-white rounded-full shadow-[var(--shadow-md)] ring-2 ring-white dark:ring-[var(--surface-2)] text-[0.85rem] font-black transition-transform hover:scale-110 cursor-pointer">
          ${count}
        </div>
      </div>
    `,
  });
}

const iconCache = new Map<string, L.DivIcon>();
const clusterIconCache = new Map<number, L.DivIcon>();

function getCachedPinIcon(business: BusinessMapPoint | undefined, selected: boolean): L.DivIcon {
  if (!business) {
    return createPinIcon(undefined, selected);
  }
  const cacheKey = `${business.id}-${selected}`;
  let icon = iconCache.get(cacheKey);
  if (!icon) {
    icon = createPinIcon(business, selected);
    iconCache.set(cacheKey, icon);
  }
  return icon;
}

function getCachedClusterIcon(count: number): L.DivIcon {
  let icon = clusterIconCache.get(count);
  if (!icon) {
    icon = createClusterIcon(count);
    clusterIconCache.set(count, icon);
  }
  return icon;
}

interface SucursalMarkerProps {
  business: BusinessMapPoint | undefined;
  businessId: string;
  latitude: number;
  longitude: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

const SucursalMarker = memo(function SucursalMarker({
  business,
  businessId,
  latitude,
  longitude,
  selected,
  onSelect,
}: SucursalMarkerProps) {
  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(businessId),
    }),
    [businessId, onSelect]
  );

  const icon = useMemo(
    () => getCachedPinIcon(business, selected),
    [business, selected]
  );

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  );
});

interface ClusterMarkerProps {
  latitude: number;
  longitude: number;
  pointCount: number;
  clusterId: number;
  index: Supercluster<BusinessFeatureProps>;
  onClick: (lat: number, lng: number, zoom: number) => void;
}

const ClusterMarker = memo(function ClusterMarker({
  latitude,
  longitude,
  pointCount,
  clusterId,
  index,
  onClick,
}: ClusterMarkerProps) {
  const eventHandlers = useMemo(
    () => ({
      click: () => {
        const zoom = Math.min(index.getClusterExpansionZoom(clusterId), 18);
        onClick(latitude, longitude, zoom);
      },
    }),
    [latitude, longitude, clusterId, index, onClick]
  );

  const icon = useMemo(
    () => getCachedClusterIcon(pointCount),
    [pointCount]
  );

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  );
});

export default function SucursalesMapMarkers({
  businesses,
  viewport,
  selectedBusinessId,
  onSelectBusiness,
}: SucursalesMapMarkersProps) {
  const map = useMap();

  const points = useMemo(
    () =>
      businesses.map((business) => ({
        type: "Feature" as const,
        properties: {
          businessId: business.id,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [business.longitude, business.latitude] as [number, number],
        },
      })),
    [businesses]
  );

  const index = useMemo(() => {
    const supercluster = new Supercluster<BusinessFeatureProps>({
      radius: 60,
      maxZoom: 18,
      minZoom: 0,
    });
    supercluster.load(points);
    return supercluster;
  }, [points]);

  const clusters = useMemo(() => {
    return index.getClusters(
      [viewport.west, viewport.south, viewport.east, viewport.north],
      Math.max(0, Math.round(viewport.zoom))
    );
  }, [index, viewport]);

  const handleClusterClick = useCallback((lat: number, lng: number, zoom: number) => {
    map.flyTo([lat, lng], zoom, { duration: 0.35 });
  }, [map]);

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates as [number, number];
        const clusterProperties = cluster.properties as ClusterProperties;

        if (clusterProperties.cluster) {
          const clusterId = clusterProperties.cluster_id;
          const pointCount = clusterProperties.point_count;
          const key = `cluster-${clusterId}`;

          return (
            <ClusterMarker
              key={key}
              latitude={latitude}
              longitude={longitude}
              pointCount={pointCount}
              clusterId={clusterId}
              index={index}
              onClick={handleClusterClick}
            />
          );
        }

        const properties = cluster.properties as BusinessFeatureProps;
        const businessId = properties.businessId;
        const key = `business-${businessId}`;
        const business = businesses.find((b) => b.id === businessId);

        return (
          <SucursalMarker
            key={key}
            business={business}
            businessId={businessId}
            latitude={latitude}
            longitude={longitude}
            selected={selectedBusinessId === businessId}
            onSelect={onSelectBusiness}
          />
        );
      })}
    </>
  );
}
