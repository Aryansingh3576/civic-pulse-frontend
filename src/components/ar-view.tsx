"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, MapPin, Navigation, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArView({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(true);

    // Mock AR points
    const points = [
        { id: 1, label: "Pothole", dist: "15m", x: 20, y: 40, color: "bg-rose-500" },
        { id: 2, label: "Broken Light", dist: "45m", x: 70, y: 30, color: "bg-amber-500" },
        { id: 3, label: "Garbage Dump", dist: "120m", x: 45, y: 60, color: "bg-emerald-500" },
    ];

    setTimeout(() => setLoading(false), 1500);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Camera Feed Simulation */}
            <div className="relative flex-1 bg-slate-900 overflow-hidden">
                {/* Background (Mock Camera) */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1517482529909-6638eb3aa1aa?q=80&w=2666&auto=format&fit=crop')] bg-cover bg-center grayscale" />

                {/* AR Overlay UI */}
                <div className="absolute inset-0 p-6 pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-mono border border-white/10">
                            <span className="animate-pulse text-red-500 mr-2">●</span>
                            LIVE VIEW • 3 ISSUES NEARBY
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black/40 hover:bg-black/60 text-white rounded-full h-10 w-10 border border-white/10"
                            onClick={onClose}
                        >
                            <X className="size-5" />
                        </Button>
                    </div>

                    {/* AR Markers */}
                    {!loading && points.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`relative px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-2 transition-all group-hover:scale-110 ${p.color.replace("bg-", "bg-opacity-80 bg-")}`}>
                                    {p.label} <span className="opacity-70 font-normal">({p.dist})</span>
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r border-white/20 bg-inherit"></div>
                                </div>
                                <div className={`size-4 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] ${p.color}`} />
                                <div className="h-20 w-px bg-gradient-to-t from-transparent to-white/50" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading State */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center text-white/50 gap-2">
                                <span className="size-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span className="text-xs tracking-widest uppercase">Calibrating Sensors...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* HUD Elements */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute top-1/2 left-10 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <div className="absolute top-1/2 right-10 w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>

            {/* Compass / Directions Hint */}
            <div className="bg-black text-white p-4 pb-8 text-center border-t border-white/10">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Navigation className="size-4 text-primary" />
                    Point camera at street level to identify issues
                </p>
            </div>
        </div>
    );
}
