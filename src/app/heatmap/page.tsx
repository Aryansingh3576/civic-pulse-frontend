"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Flame, AlertTriangle, MapPin, Clock, Loader2, TrendingUp,
    Filter, BarChart3, Eye, ChevronRight, Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import Footer from "@/components/footer";

const HeatmapMap = dynamic(() => import("@/components/heatmap-view"), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] rounded-2xl bg-white/5 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
        </div>
    ),
});

interface HeatPoint {
    latitude: number; longitude: number; status: string;
    priority_score: number; category: string; created_at: string;
}

interface NeglectedArea {
    address: string; count: number; oldest_days: number;
}

interface CatDominance {
    address: string; category: string; count: number;
}

const periodOptions = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
];

const STATUS_COLORS: Record<string, string> = {
    Submitted: "text-amber-400 bg-amber-500/10",
    "In Progress": "text-blue-400 bg-blue-500/10",
    Resolved: "text-emerald-400 bg-emerald-500/10",
};

export default function HeatmapPage() {
    const [points, setPoints] = useState<HeatPoint[]>([]);
    const [neglected, setNeglected] = useState<NeglectedArea[]>([]);
    const [dominance, setDominance] = useState<CatDominance[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState("30");

    useEffect(() => {
        setLoading(true);
        api.get(`/complaints/heatmap?period=${period}`)
            .then((res) => {
                setPoints(res.data?.data?.points || []);
                setNeglected(res.data?.data?.neglectedAreas || []);
                setDominance(res.data?.data?.categoryDominance || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [period]);

    const stats = useMemo(() => {
        const total = points.length;
        const unresolved = points.filter((p) => p.status !== "Resolved" && p.status !== "Closed").length;
        const highPriority = points.filter((p) => (p.priority_score || 0) > 70).length;
        return { total, unresolved, highPriority };
    }, [points]);

    // Group dominance by area for display
    const areaGroups = useMemo(() => {
        const groups: Record<string, { category: string; count: number }[]> = {};
        dominance.forEach((d) => {
            if (!groups[d.address]) groups[d.address] = [];
            groups[d.address].push({ category: d.category, count: d.count });
        });
        return Object.entries(groups).slice(0, 5);
    }, [dominance]);

    return (
        <div className="min-h-screen">
            <div className="pt-24 pb-12 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-400">
                                <Flame className="size-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)]">
                                    Hotspot <span className="gradient-text">Heatmap</span>
                                </h1>
                                <p className="text-muted-foreground text-sm">Real-time civic intelligence — identify red zones and neglected areas.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats + Period Toggle */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            {[
                                { label: "Total Issues", value: stats.total, color: "text-blue-400 bg-blue-500/10", icon: BarChart3 },
                                { label: "Unresolved", value: stats.unresolved, color: "text-amber-400 bg-amber-500/10", icon: AlertTriangle },
                                { label: "Critical", value: stats.highPriority, color: "text-rose-400 bg-rose-500/10", icon: Shield },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 border border-border/20">
                                    <div className={cn("p-1.5 rounded-lg", s.color)}><s.icon className="size-3.5" /></div>
                                    <div>
                                        <p className="text-lg font-bold tabular-nums leading-none">{s.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {periodOptions.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-medium transition-all",
                                        period === p.value
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-muted border border-transparent"
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Map */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="glass-card overflow-hidden rounded-2xl mb-8">
                        {loading ? (
                            <div className="h-[500px] flex items-center justify-center">
                                <Loader2 className="size-8 text-primary animate-spin" />
                            </div>
                        ) : (
                            <HeatmapMap points={points} />
                        )}
                    </motion.div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Most Neglected Areas */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="glass-card border-border/20 h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertTriangle className="size-5 text-rose-400" />
                                        Most Neglected Areas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {neglected.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-6 text-center">No data available for this period.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {neglected.map((area, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-rose-500/20 transition-colors">
                                                    <div className={cn("size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                        i === 0 ? "bg-rose-500/20 text-rose-400" : i < 3 ? "bg-amber-500/15 text-amber-400" : "bg-muted/20 text-muted-foreground"
                                                    )}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{area.address}</p>
                                                        <p className="text-xs text-muted-foreground">{area.count} unresolved · {area.oldest_days}d+ old</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                                                        RED ZONE
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Category Dominance by Area */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="glass-card border-border/20 h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TrendingUp className="size-5 text-primary" />
                                        Area-wise Problem Dominance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {areaGroups.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-6 text-center">No data available for this period.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {areaGroups.map(([area, cats], i) => (
                                                <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="size-3.5 text-primary shrink-0" />
                                                        <p className="text-sm font-medium truncate">{area}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {cats.map((c, j) => (
                                                            <Badge key={j} variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                                                {c.category} ({c.count})
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
