"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
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
 * Affiche des marqueurs (circleMarker) groupés par ville, colorés selon le type d'utilisateur.
 * On utilise des circleMarkers (pas besoin d'icônes externes, évite les soucis d'import d'assets).
 */
export function FranceMap({ points, height = 320 }: FranceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Centré sur la France métropolitaine
    const map = L.map(containerRef.current, {
      center: [46.6, 2.4],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: true,
    });

    // Tuiles OpenStreetMap (gratuites)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    // Fix la taille après le rendu
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    const layer = layerRef.current;
    layer.clearLayers();

    points.forEach((p) => {
      const color = pointColor(p.type);
      const radius = Math.min(6 + p.count * 1.5, 22);

      // Cercle coloré proportionnel au nombre d'utilisateurs
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

    // Ajuster la vue pour englober tous les points (si au moins un)
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
    }
  }, [points]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%", borderRadius: "16px", overflow: "hidden", zIndex: 0 }}
    />
  );
}

