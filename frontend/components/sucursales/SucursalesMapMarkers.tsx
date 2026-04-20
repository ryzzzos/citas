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
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sucursales-pin-store" aria-hidden="true">',
  '<path d="M2 9h1a1 1 0 0 1 1 1v5" />',
  '<path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />',
  '<path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />',
  "</svg>",
].join("");

function createPinIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: "sucursales-pin-icon",
    iconSize: [52, 62],
    iconAnchor: [26, 50],
    html: `<span class="sucursales-pin ${selected ? "is-selected" : ""}"><span class="sucursales-pin-marker"><span class="sucursales-pin-core">${STORE_ICON_SVG}</span></span><span class="sucursales-pin-shadow"></span></span>`,
  });
}

function createClusterIcon(count: number): L.DivIcon {
  const size = count >= 100 ? 52 : count >= 20 ? 46 : 40;
  return L.divIcon({
    className: "sucursales-cluster-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="sucursales-cluster-bubble">${count}</span>`,
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
