"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Building, Shield, Heart, Flame, Loader2, Navigation, Search,
    Hospital, School, Landmark, AlertCircle, Camera, X
} from "lucide-react";
import dynamic from "next/dynamic";
import ArView from "@/components/ar-view";

const NearbyMap = dynamic(() => import("@/components/nearby-map"), {
    ssr: false, loading: () => (
        <div className="h-[500px] rounded-xl bg-white/5 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
        </div>
    )
});

interface Service {
    name: string;
    type: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
}

const SERVICE_TYPES = [
    { id: "all", label: "All Services", icon: MapPin },
    { id: "issue", label: "Issues Near Me", icon: AlertCircle },
    { id: "hospital", label: "Hospitals", icon: Hospital },
    { id: "police", label: "Police Stations", icon: Shield },
    { id: "fire", label: "Fire Stations", icon: Flame },
    { id: "school", label: "Schools", icon: School },
    { id: "government", label: "Government Offices", icon: Landmark },
];

// Fallback nearby services around Jaipur
const DEMO_SERVICES: Service[] = [
    { name: "Pothole on Main Road", type: "issue", address: "JLN Marg, Near SMS", lat: 26.9020, lng: 75.8030 },
    { name: "Broken Street Light", type: "issue", address: "Civil Lines, Gate 2", lat: 26.9260, lng: 75.7900 },
    { name: "Garbage Dump", type: "issue", address: "Tonk Road", lat: 26.8970, lng: 75.8010 },
    { name: "SMS Hospital", type: "hospital", address: "JLN Marg, Jaipur", lat: 26.9012, lng: 75.8024, phone: "0141-2518888" },
    { name: "Jaipur Police Station", type: "police", address: "MI Road, Jaipur", lat: 26.9154, lng: 75.7870, phone: "100" },
    { name: "Fire Station Central", type: "fire", address: "Tonk Road, Jaipur", lat: 26.8960, lng: 75.8001, phone: "101" },
    { name: "District Collector Office", type: "government", address: "Civil Lines, Jaipur", lat: 26.9250, lng: 75.7890 },
    { name: "Govt Senior Secondary School", type: "school", address: "Gopalbari, Jaipur", lat: 26.9180, lng: 75.7950 },
    { name: "Narayana Hospital", type: "hospital", address: "Sector 28, Kumbha Marg", lat: 26.8500, lng: 75.7670, phone: "0141-7122222" },
    { name: "Mansarovar Police Station", type: "police", address: "Mansarovar, Jaipur", lat: 26.8670, lng: 75.7530 },
    { name: "Malviya Nagar Fire Station", type: "fire", address: "Malviya Nagar, Jaipur", lat: 26.8580, lng: 75.8120 },
];

export default function NearbyServicesPage() {
    const [services] = useState<Service[]>(DEMO_SERVICES);
    const [filter, setFilter] = useState("all");
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const [showAr, setShowAr] = useState(false);

    const getLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            () => setLocating(false),
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    const filtered = filter === "all" ? services : services.filter((s) => s.type === filter);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <AnimatePresence>
                {showAr && <ArView onClose={() => setShowAr(false)} />}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                            Nearby <span className="gradient-text">Services</span>
                        </h1>
                        <p className="text-muted-foreground">Find hospitals, police stations, and report issues near you.</p>
                    </div>

                    <button
                        onClick={() => setShowAr(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Camera className="size-5" />
                        AR View
                    </button>
                </motion.div>

                {/* Location Banner */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Navigation className={`size-5 ${userLocation ? "text-emerald-400" : "text-muted-foreground"}`} />
                            <span className="text-sm">
                                {userLocation
                                    ? `Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                                    : "Enable location for better results"}
                            </span>
                        </div>
                        <button
                            onClick={getLocation}
                            disabled={locating}
                            className="px-4 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                        >
                            {locating ? "Locating..." : userLocation ? "Refresh" : "Enable Location"}
                        </button>
                    </div>
                </motion.div>

                {/* Category Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {SERVICE_TYPES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setFilter(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === t.id
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                                }`}
                        >
                            <t.icon className="size-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
                            <NearbyMap services={filtered} userLocation={userLocation} />
                        </motion.div>
                    </div>

                    {/* Service List */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
                        {filtered.map((s, i) => {
                            const typeInfo = SERVICE_TYPES.find((t) => t.id === s.type);
                            return (
                                <motion.div
                                    key={`${s.name}-${i}`}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                    className="glass-card p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 text-primary p-2 rounded-xl shrink-0">
                                            {typeInfo ? <typeInfo.icon className="size-4" /> : <MapPin className="size-4" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-sm">{s.name}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <MapPin className="size-3 shrink-0" /> {s.address}
                                            </p>
                                            {s.phone && (
                                                <a href={`tel:${s.phone}`} className="text-xs text-primary mt-1 inline-block hover:underline">
                                                    📞 {s.phone}
                                                </a>
                                            )}
                                            {s.type === 'issue' && (
                                                <span className="text-xs text-rose-500 font-medium mt-1 block">
                                                    Reported Issue
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <MapPin className="size-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No services found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
