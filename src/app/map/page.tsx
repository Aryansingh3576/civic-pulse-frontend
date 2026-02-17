"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Filter, Eye } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for Leaflet (no SSR)
const MapView = dynamic(() => import("@/components/map-view"), {
    ssr: false, loading: () => (
        <div className="h-[600px] rounded-xl bg-white/5 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
        </div>
    )
});

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

const statusFilters = ["All", "Submitted", "In Progress", "Resolved"];

export default function MapPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        fetch(`${API}/complaints`)
            .then((r) => r.json())
            .then((data) => {
                const raw = data?.data?.complaints || data;
                if (Array.isArray(raw)) {
                    setIssues(
                        raw
                            .filter((c: any) => c.latitude && c.longitude)
                            .map((c: any) => ({
                                id: c.id,
                                title: c.title || "Untitled",
                                description: c.description || "",
                                status: c.status || "Submitted",
                                category: c.category || "General",
                                address: c.address || "Unknown",
                                latitude: parseFloat(c.latitude),
                                longitude: parseFloat(c.longitude),
                                upvotes: c.upvotes || 0,
                            }))
                    );
                }
            })
            .catch(() => {
                // Demo data
                setIssues([
                    { id: 1, title: "Large Pothole", description: "Dangerous pothole on main road", status: "Submitted", category: "Pothole", address: "MG Road", latitude: 26.9124, longitude: 75.7873, upvotes: 12 },
                    { id: 2, title: "Broken Street Light", description: "Complete darkness at night", status: "In Progress", category: "Street Light", address: "Station Rd", latitude: 26.9200, longitude: 75.7800, upvotes: 8 },
                    { id: 3, title: "Garbage Pile", description: "Uncollected for 3 days", status: "Resolved", category: "Garbage", address: "Civil Lines", latitude: 26.9050, longitude: 75.7950, upvotes: 15 },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "All" ? issues : issues.filter((i) => i.status === filter);

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                        Issue <span className="gradient-text">Map</span>
                    </h1>
                    <p className="text-muted-foreground">Explore civic issues across your city on an interactive map.</p>
                </motion.div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="size-4 text-muted-foreground shrink-0" />
                    {statusFilters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto">{filtered.length} issues</span>
                </div>

                {/* Map */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
                    {loading ? (
                        <div className="h-[600px] flex items-center justify-center">
                            <Loader2 className="size-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <MapView issues={filtered} />
                    )}
                </motion.div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground justify-center">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400" /> Submitted</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400" /> In Progress</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400" /> Resolved</span>
                </div>
            </div>
        </div>
    );
}
