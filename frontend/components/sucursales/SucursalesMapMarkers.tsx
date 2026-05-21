"use client";

import { useMemo } from "react";
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

const STORE_ICON_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">',
  '<path d="M2 9h1a1 1 0 0 1 1 1v5" />',
  '<path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />',
  '<path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />',
  "</svg>",
].join("");

function createPinIcon(selected: boolean): L.DivIcon {
  const bgClass = selected ? 'bg-[var(--app-primary)] text-white' : 'bg-[var(--surface-3)] text-[var(--app-primary)]';
  const ringClass = selected ? 'ring-4 ring-[var(--app-primary)]/20 shadow-[var(--shadow-md)]' : 'ring-1 ring-[var(--border-strong)] shadow-[var(--shadow-md)]';
  const arrowColor = selected ? 'border-t-[var(--app-primary)]' : 'border-t-[var(--surface-3)]';

  return L.divIcon({
    className: "bg-transparent border-none",
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 ${bgClass} rounded-full ${ringClass} transition-all duration-300 transform ${selected ? 'scale-110 z-50' : 'hover:scale-105'} cursor-pointer">
        ${STORE_ICON_SVG}
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${arrowColor} drop-shadow-sm"></div>
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
      <div class="flex items-center justify-center w-full h-full bg-[var(--app-primary)] text-white rounded-full shadow-[var(--shadow-md)] ring-[5px] ring-white/90 dark:ring-[var(--surface-1)]/90 text-[14px] font-bold transition-transform hover:scale-110 cursor-pointer">
        ${count}
      </div>
    `,
  });
}

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
            <Marker
              key={key}
              position={[latitude, longitude]}
              icon={createClusterIcon(pointCount)}
              eventHandlers={{
                click: () => {
                  const zoom = Math.min(index.getClusterExpansionZoom(clusterId), 18);
                  map.flyTo([latitude, longitude], zoom, { duration: 0.35 });
                },
              }}
            />
          );
        }

        const properties = cluster.properties as BusinessFeatureProps;
        const businessId = properties.businessId;
        const key = `business-${businessId}`;

        return (
          <Marker
            key={key}
            position={[latitude, longitude]}
            icon={createPinIcon(selectedBusinessId === businessId)}
            eventHandlers={{
              click: () => onSelectBusiness(businessId),
            }}
          />
        );
      })}
    </>
  );
}
