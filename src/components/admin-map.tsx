"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Complaint {
    id: number;
    title: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
    address?: string;
    priority_score?: number;
    created_at?: string;
}

const STATUS_COLORS: Record<string, string> = {
    Submitted: "#f59e0b",
    submitted: "#f59e0b",
    "In Progress": "#3b82f6",
    in_progress: "#3b82f6",
    Resolved: "#10b981",
    resolved: "#10b981",
    Rejected: "#ef4444",
    rejected: "#ef4444",
};

const CAT_EMOJI: Record<string, string> = {
    garbage: "🗑️",
    water: "💧",
    electricity: "⚡",
    road: "🚧",
    streetlights: "💡",
    safety: "🛡️",
    drainage: "🔧",
    "stray-animals": "🐾",
    other: "📌",
};

function createIcon(complaint: Complaint) {
    const color = STATUS_COLORS[complaint.status] || "#6b7280";
    const emoji = CAT_EMOJI[complaint.category] || "📌";
    const priority = complaint.priority_score || 50;
    const size = priority > 70 ? 36 : 30;

    return L.divIcon({
        className: "",
        html: `<div style="
            width:${size}px;height:${size}px;border-radius:10px;
            background:${color};border:2px solid white;
            box-shadow:0 2px 10px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
            font-size:${size > 32 ? 18 : 14}px;cursor:pointer;
            transition:transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

export default function AdminMap({ complaints }: { complaints: Complaint[] }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        // Detect user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                    // Fallback to default 
                    setUserLocation({ lat: 26.9124, lng: 75.7873 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setUserLocation({ lat: 26.9124, lng: 75.7873 });
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current || !userLocation) return;

        const validComplaints = complaints.filter(c => c.latitude && c.longitude);
        const center: [number, number] = validComplaints.length > 0
            ? [validComplaints[0].latitude, validComplaints[0].longitude]
            : [userLocation.lat, userLocation.lng];

        const map = L.map(mapRef.current, {
            center,
            zoom: 12,
            zoomControl: false,
        });

        // Add zoom control to bottom-right for mobile friendliness
        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }).addTo(map);

        // User location marker
        const userIcon = L.divIcon({
            className: "",
            html: `<div style="
                width:20px;height:20px;border-radius:50%;
                background:#3b82f6;border:3px solid white;
                box-shadow:0 0 0 4px rgba(59,130,246,0.3), 0 2px 8px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
            "></div>
            <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,0.3)}50%{box-shadow:0 0 0 12px rgba(59,130,246,0.1)}}</style>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .bindPopup("<strong>📍 Your Location</strong>")
            .addTo(map);

        // Add complaint markers
        validComplaints.forEach((c) => {
            const marker = L.marker([c.latitude, c.longitude], { icon: createIcon(c) });
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
            }) : "N/A";

            marker.bindPopup(`
                <div style="min-width:180px;max-width:260px;font-family:system-ui,sans-serif;">
                    <h4 style="margin:0 0 6px;font-size:13px;font-weight:700;line-height:1.3;">${c.title}</h4>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
                        <span style="background:${STATUS_COLORS[c.status] || '#6b7280'}22;color:${STATUS_COLORS[c.status] || '#6b7280'};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;">${c.status}</span>
                        <span style="background:#f3f4f6;padding:2px 8px;border-radius:20px;font-size:10px;">${c.category || 'N/A'}</span>
                    </div>
                    <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.4;">📍 ${c.address || 'Unknown'}</p>
                    <p style="margin:4px 0 0;font-size:10px;color:#9ca3af;">📅 ${date}</p>
                    <a href="/admin/complaints/${c.id}" style="display:inline-block;margin-top:6px;font-size:11px;color:#6366f1;text-decoration:none;font-weight:600;">View Details →</a>
                </div>
            `);
            marker.addTo(map);
        });

        // Fit bounds to show all markers
        if (validComplaints.length > 1) {
            const allPoints: [number, number][] = [
                [userLocation.lat, userLocation.lng],
                ...validComplaints.map(c => [c.latitude, c.longitude] as [number, number])
            ];
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }

        mapInstance.current = map;

        // Handle resize for responsiveness
        const handleResize = () => map.invalidateSize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            map.remove();
            mapInstance.current = null;
        };
    }, [complaints, userLocation]);

    return <div ref={mapRef} className="h-full w-full rounded-xl" style={{ minHeight: "350px" }} />;
}
