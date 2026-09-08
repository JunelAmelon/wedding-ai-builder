"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  city: string;
  count: number;
  type: "vendor" | "couple" | "mixed";
  lat: number;
  lon: number;
}

interface FranceMapProps {
  points: MapPoint[];
  height?: number;
}

function pointColor(type: string) {
  return type === "vendor" ? "#2563eb" : type === "couple" ? "#db2777" : "#8b5cf6";
}

/**
 * Carte interactive de France avec Leaflet.
 * Chargement dynamique de Leaflet côté client pour éviter l'accès à `window` pendant le SSR (static export).
 */
export function FranceMap({ points, height = 320 }: FranceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;
    const init = async () => {
      const leaflet = await import("leaflet");
      if (!mounted || !containerRef.current || mapRef.current) return;

      const map = leaflet.map(containerRef.current, {
        center: [46.6, 2.4],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
      });

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const layer = leaflet.layerGroup().addTo(map);

      mapRef.current = map;
      layerRef.current = layer;

      setL(leaflet);

      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!L || !layerRef.current || !mapRef.current) return;

    const layer = layerRef.current;
    layer.clearLayers();

    points.forEach((p) => {
      const color = pointColor(p.type);
      const radius = Math.min(6 + p.count * 1.5, 22);

      const marker = L.circleMarker([p.lat, p.lon], {
        radius,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
      });

      marker.bindTooltip(
        `<strong>${p.city}</strong><br/>${p.count} utilisateur(s)`,
        { direction: "top", offset: [0, -radius] }
      );

      marker.addTo(layer);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
    }
  }, [points, L]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%", borderRadius: "16px", overflow: "hidden", zIndex: 0 }}
    />
  );
}
