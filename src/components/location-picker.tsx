"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Check } from "lucide-react";

interface LocationPickerProps {
    initialLat: number;
    initialLng: number;
    onSelect: (lat: number, lng: number, address: string) => void;
    onClose: () => void;
}

export default function LocationPicker({ initialLat, initialLng, onSelect, onClose }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const map = L.map(mapRef.current, {
            center: [initialLat, initialLng],
            zoom: 15,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        }).addTo(map);

        // Custom Icon
        const icon = L.divIcon({
            className: "",
            html: `<div style="
                width:32px;height:32px;display:flex;align-items:center;justify-content:center;
                background:#ef4444;border-radius:50%;border:3px solid white;
                box-shadow:0 4px 12px rgba(0,0,0,0.3);
            "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        const marker = L.marker([initialLat, initialLng], { icon, draggable: true }).addTo(map);
        markerRef.current = marker;

        // Drag End Listener
        marker.on("dragend", (e) => {
            const { lat, lng } = e.target.getLatLng();
            setSelectedCoords({ lat, lng });
            fetchAddress(lat, lng);
        });

        // Map Click Listener
        map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setSelectedCoords({ lat, lng });
            fetchAddress(lat, lng);
        });

        mapInstance.current = map;

        // Initial fetch
        fetchAddress(initialLat, initialLng);

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    async function fetchAddress(lat: number, lng: number) {
        setLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex items-center justify-between bg-card/50">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MapPin className="size-5 text-primary" /> Pin Location on Map
                        </h3>
                        <p className="text-xs text-muted-foreground">Drag marker or tap anywhere to set location</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
                </div>

                <div className="relative flex-1 min-h-[400px]">
                    <div ref={mapRef} className="absolute inset-0 z-0 bg-muted/20" />
                    {/* Center Marker Target (Visual Guide) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-50 hidden">
                        <MapPin className="size-8 text-primary mb-4" />
                    </div>
                </div>

                <div className="p-4 bg-card/50 border-t space-y-4">
                    <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Selected Address</p>
                        <p className="text-sm font-medium leading-relaxed">
                            {loading ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Fetching address...</span> : address}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button
                            className="flex-1 gap-2"
                            disabled={loading}
                            onClick={() => onSelect(selectedCoords.lat, selectedCoords.lng, address)}
                        >
                            <Check className="size-4" /> Confirm Location
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
