"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Issue {
    id: number;
    title: string;
    description: string;
    status: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    upvotes: number;
}

const STATUS_MARKER_COLORS: Record<string, string> = {
    Submitted: "#f59e0b",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
    Closed: "#6b7280",
};

// Default fallback: center of India
const DEFAULT_CENTER: [number, number] = [22.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const LOCATED_ZOOM = 13;

function createMarkerIcon(color: string) {
    return L.divIcon({
        className: "",
        html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
    });
}

function createUserLocationIcon() {
    return L.divIcon({
        className: "",
        html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:#3b82f6;border:4px solid white;
      box-shadow:0 0 0 3px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

export default function MapView({ issues }: { issues: Issue[] }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [locating, setLocating] = useState(true);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Create map with default view first
        const map = L.map(mapRef.current, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapInstance.current = map;

        // Request user's location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Guard: map may have been unmounted before callback fires
                    if (!mapInstance.current) return;
                    const { latitude, longitude } = position.coords;
                    mapInstance.current.setView([latitude, longitude], LOCATED_ZOOM, { animate: true });

                    // Add a "You are here" marker
                    L.marker([latitude, longitude], { icon: createUserLocationIcon() })
                        .addTo(mapInstance.current)
                        .bindPopup("<b>Your Location</b>")
                        .openPopup();

                    setLocating(false);
                },
                () => {
                    // User denied or error — stay at default
                    setLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        } else {
            setLocating(false);
        }

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // Update markers when issues change
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        // Clear existing issue markers (keep user location marker)
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                const el = (layer as any)._icon;
                // Keep the blue user-location marker
                if (el && el.innerHTML?.includes("#3b82f6") && el.innerHTML?.includes("rgba(59,130,246")) return;
                map.removeLayer(layer);
            }
        });

        // Add issue markers
        issues.forEach((issue) => {
            if (!issue.latitude || !issue.longitude) return;

            const color = STATUS_MARKER_COLORS[issue.status] || "#6b7280";
            const marker = L.marker([issue.latitude, issue.longitude], {
                icon: createMarkerIcon(color),
            });

            marker.bindPopup(`
        <div style="min-width:180px;font-family:sans-serif;">
          <h4 style="margin:0 0 4px;font-size:14px;font-weight:600;">${issue.title}</h4>
          <p style="margin:0 0 6px;font-size:12px;color:#666;">${issue.description?.slice(0, 100) || ""}</p>
          <div style="display:flex;gap:8px;font-size:11px;color:#888;">
            <span style="background:${color}20;color:${color};padding:2px 8px;border-radius:99px;font-weight:500;">${issue.status}</span>
            <span>${issue.category}</span>
          </div>
          ${issue.address ? `<div style="margin-top:4px;font-size:11px;color:#999;">📍 ${issue.address}</div>` : ""}
        </div>
      `);

            marker.addTo(map);
        });

        // Fit bounds if there are issues
        if (issues.length > 0) {
            const validIssues = issues.filter(i => i.latitude && i.longitude);
            if (validIssues.length > 0) {
                const bounds = L.latLngBounds(validIssues.map((i) => [i.latitude, i.longitude] as [number, number]));
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
            }
        }
    }, [issues]);

    return (
        <div className="relative">
            <div ref={mapRef} className="h-[600px] w-full rounded-xl" />
            {locating && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-5 py-2.5 flex items-center gap-2 text-sm shadow-lg">
                    <div className="size-2 rounded-full bg-primary animate-ping" />
                    <span className="text-muted-foreground">Detecting your location...</span>
                </div>
            )}
        </div>
    );
}
