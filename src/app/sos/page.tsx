"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Phone, AlertTriangle, Shield, Heart, Flame, Siren,
    MapPin, Clock, ChevronRight, Bell, Info, ShieldAlert,
} from "lucide-react";

const EMERGENCY_NUMBERS = [
    { name: "Police", number: "100", icon: ShieldAlert, color: "text-blue-400", bg: "bg-blue-400/10", gradient: "from-blue-500/20 to-blue-600/10" },
    { name: "Ambulance", number: "108", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10", gradient: "from-rose-500/20 to-rose-600/10" },
    { name: "Fire Brigade", number: "101", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10", gradient: "from-orange-500/20 to-orange-600/10" },
    { name: "Women Helpline", number: "1091", icon: Shield, color: "text-purple-400", bg: "bg-purple-400/10", gradient: "from-purple-500/20 to-purple-600/10" },
    { name: "Child Helpline", number: "1098", icon: Heart, color: "text-emerald-400", bg: "bg-emerald-400/10", gradient: "from-emerald-500/20 to-emerald-600/10" },
    { name: "Disaster Mgmt", number: "1078", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", gradient: "from-amber-500/20 to-amber-600/10" },
];

const SAFETY_TIPS = [
    "Stay calm and assess the situation before calling.",
    "Share your exact location — use landmarks if needed.",
    "Keep emergency numbers saved in your phone.",
    "If there's a fire, leave the building immediately. Don't use elevators.",
    "In case of medical emergency, don't move the injured unless absolutely necessary.",
    "Keep a basic first aid kit at home and in your vehicle.",
];

export default function SOSPage() {
    const [locationStatus, setLocationStatus] = useState<string>("idle");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const shareLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("unsupported");
            return;
        }
        setLocationStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationStatus("success");
            },
            () => setLocationStatus("error"),
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-2xl bg-rose-400/10 text-rose-400 mb-4">
                        <Siren className="size-10" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-3">
                        <span className="text-rose-400">SOS</span> Emergency
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        Quick access to emergency services. Tap to call immediately.
                    </p>
                </motion.div>

                {/* Location Share Button */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MapPin className={`size-5 ${coords ? "text-emerald-400" : "text-muted-foreground"}`} />
                            <div>
                                <div className="font-medium text-sm">Share My Location</div>
                                {coords ? (
                                    <div className="text-xs text-emerald-400">📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">Enable location to help responders find you</div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={shareLocation}
                            disabled={locationStatus === "loading"}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${coords
                                    ? "bg-emerald-400/10 text-emerald-400"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                        >
                            {locationStatus === "loading" ? "Locating..." : coords ? "Located ✓" : "Get Location"}
                        </button>
                    </div>
                </motion.div>

                {/* Emergency Numbers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {EMERGENCY_NUMBERS.map((e, i) => (
                        <motion.a
                            key={e.number}
                            href={`tel:${e.number}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.08 }}
                            className={`glass-card p-6 group hover:border-${e.color.replace("text-", "")}/30 transition-all cursor-pointer`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${e.bg} ${e.color}`}>
                                    <e.icon className="size-6" />
                                </div>
                                <Phone className={`size-5 ${e.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{e.name}</h3>
                            <div className={`text-3xl font-bold font-mono ${e.color}`}>{e.number}</div>
                            <div className="text-xs text-muted-foreground mt-2">Tap to call →</div>
                        </motion.a>
                    ))}
                </div>

                {/* Safety Tips */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Info className="size-5 text-amber-400" /> Safety Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SAFETY_TIPS.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <p className="text-sm text-muted-foreground">{tip}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
