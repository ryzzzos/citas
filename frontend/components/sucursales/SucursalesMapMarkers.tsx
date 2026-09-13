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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getShortName(fullName: string): string {
  const words = fullName.split(" ").filter(Boolean);
  if (words.length === 0) return "Sucursal";
  const firstWord = words[0];
  if (firstWord.length >= 10 || words.length === 1) {
    return firstWord;
  }
  const combined = `${words[0]} ${words[1]}`;
  if (combined.length <= 14) {
    return combined;
  }
  return firstWord;
}

function createPinIcon(business: BusinessMapPoint | undefined, selected: boolean): L.DivIcon {
  const name = business?.name ?? "Sucursal";
  const category = business?.category ?? "default";
  const logoUrl = business?.logo_image_url;
  
  const shortName = getShortName(name);
  const iconSvg = getCategoryIcon(category, selected);

  const bubbleRing = selected
    ? "ring-2 ring-white dark:ring-slate-300 border-2 border-slate-900/60 shadow-[0_12px_30px_rgba(0,0,0,0.5)] scale-115 z-50"
    : "ring-2 ring-white dark:ring-slate-800 shadow-[0_6px_18px_rgba(0,0,0,0.35)] group-hover:scale-110 group-hover:shadow-[0_10px_22px_rgba(0,0,0,0.4)]";

  const pillClass = selected
    ? "bg-slate-950 text-white border-2 border-white/40 shadow-[0_4px_14px_rgba(0,0,0,0.5)] font-bold scale-105"
    : "bg-slate-950/85 text-white/95 border border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.4)] group-hover:bg-slate-950";

  const imageHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover rounded-full select-none pointer-events-none" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
       <div class="w-full h-full items-center justify-center bg-gradient-to-tr from-[var(--surface-3)] to-[var(--surface-2)] text-[var(--app-primary)] select-none" style="display: none;">
         ${iconSvg}
       </div>`
    : `<div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-[var(--surface-3)] to-[var(--surface-2)] text-[var(--app-primary)] select-none">
         ${iconSvg}
       </div>`;

  return L.divIcon({
    className: "bg-transparent border-none",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `
      <div class="absolute -translate-x-1/2 -translate-y-[25px] pointer-events-auto cursor-pointer select-none">
        <div class="animate-marker-appear flex flex-col items-center">
          <div class="group flex flex-col items-center">
            <!-- Instagram-style Circular Bubble -->
            <div class="relative w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 bg-[var(--surface-2)] ${bubbleRing}">
              ${imageHtml}
            </div>

            <!-- Name Pill Badge Underneath -->
            <div class="mt-1 flex items-center justify-center max-w-[110px] transition-transform duration-200 group-hover:scale-105">
              <span class="truncate px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold leading-tight tracking-tight backdrop-blur-md transition-colors ${pillClass}">
                ${escapeHtml(shortName)}
              </span>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

function createClusterIcon(clusterBusinesses: BusinessMapPoint[], totalCount: number): L.DivIcon {
  const maxShown = 3;
  const shownBusinesses = clusterBusinesses.slice(0, maxShown);
  const remainingCount = totalCount - shownBusinesses.length;

  let bubblesHtml = "";

  shownBusinesses.forEach((b, idx) => {
    const name = b.name ?? "Sucursal";
    const logoUrl = b.logo_image_url;
    const category = b.category ?? "default";
    const iconSvg = getCategoryIcon(category, false);
    const zIndex = (idx + 1) * 10;
    const mlStyle = idx > 0 ? "margin-left: -12px;" : "";
    const delayStyle = `animation-delay: ${idx * 45}ms;`;

    const imageHtml = logoUrl
      ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover select-none pointer-events-none" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div class="w-full h-full items-center justify-center bg-gradient-to-tr from-[var(--surface-3)] to-[var(--surface-2)] text-[var(--app-primary)] select-none" style="display: none;">
           ${iconSvg}
         </div>`
      : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[var(--surface-3)] to-[var(--surface-2)] text-[var(--app-primary)] select-none">
           ${iconSvg}
         </div>`;

    bubblesHtml += `
      <div style="width: 38px; height: 38px; z-index: ${zIndex}; ${mlStyle} ${delayStyle}" class="animate-cluster-bubble relative rounded-full overflow-hidden bg-[var(--surface-2)] ring-2 ring-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] flex items-center justify-center shrink-0">
        ${imageHtml}
      </div>
    `;
  });

  if (remainingCount > 0) {
    const zIndex = (shownBusinesses.length + 1) * 10;
    const delayStyle = `animation-delay: ${shownBusinesses.length * 45}ms;`;
    bubblesHtml += `
      <div style="width: 38px; height: 38px; z-index: ${zIndex}; margin-left: -12px; ${delayStyle}" class="animate-cluster-bubble relative rounded-full bg-slate-950 dark:bg-black text-white text-[0.8rem] font-black tracking-tight ring-2 ring-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] flex items-center justify-center shrink-0 select-none">
        +${remainingCount}
      </div>
    `;
  }

  return L.divIcon({
    className: "bg-transparent border-none",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `
      <div class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer select-none">
        <div class="animate-marker-appear flex items-center">
          <div class="flex items-center transition-transform duration-200 hover:scale-105 active:scale-95">
            ${bubblesHtml}
          </div>
        </div>
      </div>
    `,
  });
}

const iconCache = new Map<string, L.DivIcon>();
const clusterIconCache = new Map<string, L.DivIcon>();

function getCachedPinIcon(business: BusinessMapPoint | undefined, selected: boolean): L.DivIcon {
  if (!business) {
    return createPinIcon(undefined, selected);
  }
  const cacheKey = `${business.id}-${selected}-${business.logo_image_url ?? "no-logo"}-${business.name}`;
  let icon = iconCache.get(cacheKey);
  if (!icon) {
    icon = createPinIcon(business, selected);
    iconCache.set(cacheKey, icon);
  }
  return icon;
}

function getCachedClusterIcon(
  clusterId: number,
  pointCount: number,
  clusterBusinesses: BusinessMapPoint[]
): L.DivIcon {
  const cacheKey = `${clusterId}-${pointCount}-${clusterBusinesses.map((b) => `${b.id}:${b.logo_image_url ?? ""}`).join(",")}`;
  let icon = clusterIconCache.get(cacheKey);
  if (!icon) {
    icon = createClusterIcon(clusterBusinesses, pointCount);
    clusterIconCache.set(cacheKey, icon);
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
  businesses: BusinessMapPoint[];
  onClick: (lat: number, lng: number, zoom: number) => void;
}

const ClusterMarker = memo(function ClusterMarker({
  latitude,
  longitude,
  pointCount,
  clusterId,
  index,
  businesses,
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

  const clusterBusinesses = useMemo(() => {
    const leaves = index.getLeaves(clusterId, 3, 0);
    return leaves
      .map((leaf) => businesses.find((b) => b.id === leaf.properties.businessId))
      .filter(Boolean) as BusinessMapPoint[];
  }, [index, clusterId, businesses]);

  const icon = useMemo(
    () => getCachedClusterIcon(clusterId, pointCount, clusterBusinesses),
    [clusterId, pointCount, clusterBusinesses]
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
    map.flyTo([lat, lng], zoom, { duration: 0.45, easeLinearity: 0.25 });
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
              businesses={businesses}
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
