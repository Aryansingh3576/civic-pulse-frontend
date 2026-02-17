"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Service {
    name: string;
    type: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
}

const TYPE_COLORS: Record<string, string> = {
    hospital: "#f43f5e",
    police: "#3b82f6",
    fire: "#f97316",
    school: "#10b981",
    government: "#8b5cf6",
};

const TYPE_EMOJI: Record<string, string> = {
    hospital: "🏥",
    police: "🚔",
    fire: "🚒",
    school: "🏫",
    government: "🏛️",
};

function createServiceIcon(type: string) {
    const color = TYPE_COLORS[type] || "#6b7280";
    return L.divIcon({
        className: "",
        html: `<div style="
      width:32px;height:32px;border-radius:8px;
      background:${color};border:2px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
    ">${TYPE_EMOJI[type] || "📍"}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
    });
}

export default function NearbyMap({
    services,
    userLocation,
}: {
    services: Service[];
    userLocation: { lat: number; lng: number } | null;
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const center: [number, number] = userLocation
            ? [userLocation.lat, userLocation.lng]
            : services.length > 0
                ? [services[0].lat, services[0].lng]
                : [26.9124, 75.7873];

        const map = L.map(mapRef.current, { center, zoom: 13 });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }).addTo(map);

        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });

        // Add user location marker
        if (userLocation) {
            const userIcon = L.divIcon({
                className: "",
                html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            });
            L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .bindPopup("<b>Your Location</b>")
                .addTo(map);
        }

        // Add service markers
        services.forEach((s) => {
            const marker = L.marker([s.lat, s.lng], { icon: createServiceIcon(s.type) });
            marker.bindPopup(`
        <div style="min-width:160px;font-family:sans-serif;">
          <h4 style="margin:0 0 4px;font-size:14px;font-weight:600;">${s.name}</h4>
          <p style="margin:0;font-size:12px;color:#666;">${s.address}</p>
          ${s.phone ? `<a href="tel:${s.phone}" style="font-size:12px;color:#3b82f6;">📞 ${s.phone}</a>` : ""}
        </div>
      `);
            marker.addTo(map);
        });

        // Fit bounds
        const allPoints: [number, number][] = services.map((s) => [s.lat, s.lng]);
        if (userLocation) allPoints.push([userLocation.lat, userLocation.lng]);
        if (allPoints.length > 0) {
            map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 14 });
        }
    }, [services, userLocation]);

    return <div ref={mapRef} className="h-[500px] w-full rounded-xl" />;
}
