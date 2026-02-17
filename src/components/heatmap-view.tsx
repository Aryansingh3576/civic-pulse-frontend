"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Simple heatmap implementation using canvas overlay
interface HeatPoint {
    latitude: number;
    longitude: number;
    priority_score: number;
    status: string;
    category: string;
    created_at: string;
}

export default function HeatmapView({ points }: { points: HeatPoint[] }) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Default center (Jaipur)
        const center: [number, number] = points.length > 0
            ? [points[0].latitude, points[0].longitude]
            : [26.9124, 75.7873];

        const map = L.map(containerRef.current, {
            center,
            zoom: 12,
            zoomControl: false,
        });

        L.control.zoom({ position: "topright" }).addTo(map);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org">OSM</a> &copy; <a href="https://carto.com">CARTO</a>',
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Clear existing overlays
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) map.removeLayer(layer);
        });

        // Category colors
        const catColors: Record<string, string> = {
            Pothole: "#ef4444",
            Garbage: "#f59e0b",
            "Street Light": "#8b5cf6",
            "Water Leakage": "#3b82f6",
            "Stray Animals": "#10b981",
        };

        // Add heatmap-style circles
        points.forEach((p) => {
            if (!p.latitude || !p.longitude) return;
            const intensity = Math.max(0.3, (p.priority_score || 50) / 100);
            const radius = 12 + intensity * 18;
            const color = catColors[p.category] || "#f97316";

            L.circleMarker([p.latitude, p.longitude], {
                radius,
                fillColor: color,
                fillOpacity: intensity * 0.6,
                color: color,
                weight: 1,
                opacity: 0.3,
            })
                .bindPopup(`
                    <div style="font-family:system-ui;min-width:180px">
                        <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${p.category || "Issue"}</div>
                        <div style="font-size:11px;color:#888;margin-bottom:6px;">${p.status}</div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;">
                            <span>Priority: ${p.priority_score || "N/A"}</span>
                            <span>${new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                `)
                .addTo(map);
        });

        // Fit bounds if points exist
        if (points.length > 0) {
            const lats = points.filter((p) => p.latitude).map((p) => p.latitude);
            const lngs = points.filter((p) => p.longitude).map((p) => p.longitude);
            if (lats.length > 0) {
                map.fitBounds([
                    [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
                    [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01],
                ]);
            }
        }
    }, [points]);

    return <div ref={containerRef} className="h-[500px] w-full" />;
}
