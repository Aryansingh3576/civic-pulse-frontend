"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3, FileText, TrendingUp, Users, AlertCircle, MapPin, CheckCircle2, Clock, Loader2,
} from "lucide-react";

interface AnalyticsData {
    byCategory: { category: string; count: number }[];
    byStatus: { status: string; count: number }[];
    monthlyTrends: { month: string; total: number; resolved: number }[];
    topAreas: { address: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
    Submitted: "#f59e0b",
    "In Progress": "#3b82f6",
    Resolved: "#10b981",
    Closed: "#6b7280",
    Escalated: "#ef4444",
};

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        Promise.all([
            fetch(`${API}/complaints/analytics`).then((r) => r.json()),
            fetch(`${API}/complaints/stats`).then((r) => r.json()),
        ])
            .then(([analyticsRes, statsRes]) => {
                setData(analyticsRes.data);
                setStats(statsRes.data);
            })
            .catch(() => {
                // Use fallback data for demo
                setData({
                    byCategory: [
                        { category: "Pothole", count: 45 },
                        { category: "Garbage", count: 38 },
                        { category: "Street Light", count: 22 },
                        { category: "Water Leakage", count: 18 },
                        { category: "Stray Animals", count: 12 },
                    ],
                    byStatus: [
                        { status: "Submitted", count: 40 },
                        { status: "In Progress", count: 25 },
                        { status: "Resolved", count: 55 },
                        { status: "Closed", count: 10 },
                    ],
                    monthlyTrends: [
                        { month: "2025-09", total: 15, resolved: 10 },
                        { month: "2025-10", total: 22, resolved: 18 },
                        { month: "2025-11", total: 30, resolved: 22 },
                        { month: "2025-12", total: 28, resolved: 25 },
                        { month: "2026-01", total: 35, resolved: 28 },
                        { month: "2026-02", total: 20, resolved: 12 },
                    ],
                    topAreas: [
                        { address: "Sector 15, Main Road", count: 8 },
                        { address: "Gandhi Nagar Market", count: 6 },
                        { address: "Station Road", count: 5 },
                        { address: "Civil Lines", count: 4 },
                        { address: "Industrial Area Phase-2", count: 3 },
                    ],
                });
                setStats({ total: 135, submitted: 40, in_progress: 25, resolved: 55, closed: 10, escalated: 5 });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-10 text-primary animate-spin" />
            </div>
        );
    }

    const totalIssues = stats?.total || 0;
    const resolvedPct = totalIssues > 0 ? Math.round(((stats?.resolved || 0) / totalIssues) * 100) : 0;

    const statCards = [
        { label: "Total Issues", value: totalIssues, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Resolved", value: stats?.resolved || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "In Progress", value: stats?.in_progress || 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Resolution Rate", value: `${resolvedPct}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
    ];

    const maxCat = data ? Math.max(...data.byCategory.map((c) => c.count), 1) : 1;
    const maxTrend = data ? Math.max(...data.monthlyTrends.map((t) => t.total), 1) : 1;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                        <span className="gradient-text">Analytics</span> Dashboard
                    </h1>
                    <p className="text-muted-foreground">Real-time insights into civic issues and resolution performance.</p>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {statCards.map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.bg} ${s.color}`}>
                                <s.icon className="size-5" />
                            </div>
                            <div className="text-3xl font-bold tabular-nums">{s.value}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Category Breakdown */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <BarChart3 className="size-5 text-primary" /> Issues by Category
                        </h3>
                        <div className="space-y-4">
                            {data?.byCategory.map((cat) => (
                                <div key={cat.category}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span>{cat.category || "Uncategorized"}</span>
                                        <span className="font-mono text-muted-foreground">{cat.count}</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(cat.count / maxCat) * 100}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Status Distribution */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <AlertCircle className="size-5 text-primary" /> Status Distribution
                        </h3>
                        <div className="space-y-4">
                            {data?.byStatus.map((s) => {
                                const pct = totalIssues > 0 ? Math.round((s.count / totalIssues) * 100) : 0;
                                const color = STATUS_COLORS[s.status] || "#6b7280";
                                return (
                                    <div key={s.status}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                                {s.status}
                                            </span>
                                            <span className="font-mono text-muted-foreground">{s.count} ({pct}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trends */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <TrendingUp className="size-5 text-primary" /> Monthly Trends
                        </h3>
                        <div className="flex items-end gap-2 h-48">
                            {data?.monthlyTrends.map((t) => (
                                <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "160px" }}>
                                        <div className="w-full flex-1 flex items-end">
                                            <motion.div
                                                className="w-full bg-primary/30 rounded-t"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(t.total / maxTrend) * 100}%` }}
                                                transition={{ duration: 0.6, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{t.month.split("-")[1]}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/30" /> Total</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> Resolved</span>
                        </div>
                    </motion.div>

                    {/* Top Areas */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                            <MapPin className="size-5 text-primary" /> Top Issue Areas
                        </h3>
                        <div className="space-y-3">
                            {data?.topAreas.map((area, i) => (
                                <div key={area.address} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <span className="text-lg font-bold text-muted-foreground/40 w-6 text-center">#{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{area.address}</div>
                                        <div className="text-xs text-muted-foreground">{area.count} reported issues</div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${area.count > 5 ? "bg-rose-400/10 text-rose-400" : "bg-amber-400/10 text-amber-400"}`}>
                                        {area.count > 5 ? "Hot Zone" : "Active"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
