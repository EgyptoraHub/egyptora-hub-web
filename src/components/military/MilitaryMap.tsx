import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { RecordType } from "@/lib/military";
import { TYPE_COLOR } from "./mapColors";

export type MapPoint = { id: string; lat: number; lng: number; label: string; type: RecordType; href: string };


const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Browser-only Leaflet map (OpenStreetMap tiles). Loaded lazily behind <ClientOnly>. */
export default function MilitaryMap({ points, height = 480 }: { points: MapPoint[]; height?: number }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([27, 31], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      const layer = L.featureGroup();
      for (const p of points) {
        L.circleMarker([p.lat, p.lng], { radius: 8, color: "#ffffff", weight: 2, fillColor: TYPE_COLOR[p.type], fillOpacity: 0.95 })
          .bindPopup(`<a href="${esc(p.href)}" style="font-weight:600;color:#0B2A45">${esc(p.label)}</a>`)
          .addTo(layer);
      }
      layer.addTo(map);
      if (points.length > 1) map.fitBounds(layer.getBounds().pad(0.2));
      else if (points.length === 1) map.setView([points[0]!.lat, points[0]!.lng], 7);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points]);

  return <div ref={el} style={{ height }} className="z-0 w-full overflow-hidden rounded-2xl border border-border" />;
}
