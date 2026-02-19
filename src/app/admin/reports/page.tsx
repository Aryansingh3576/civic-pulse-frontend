"use client";

import { useState, useEffect } from "react";
import {
    FileText, Download, Printer, Calendar, BarChart3, PieChart, TrendingUp,
    AlertTriangle, Loader2, CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
    Shield, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function ReportsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/complaints");
                setComplaints(res.data?.data?.complaints || []);
            } catch (e) { console.error("Fetch failed", e); }
            finally { setLoading(false); }
        })();
    }, []);

    function handlePrint() { window.print(); }

    function exportCSV() {
        const rows = complaints.map(c => ({
            ID: c.id, Title: c.title, Status: c.status, Category: c.category || "General",
            Priority: c.priority_score || 50, Address: c.address || "", Created: c.created_at,
        }));
        const header = Object.keys(rows[0] || {}).join(",");
        const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `executive_report_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    }

    // Stats
    const total = complaints.length;
    const resolved = complaints.filter(c => ["Resolved", "resolved", "Closed"].includes(c.status)).length;
    const open = complaints.filter(c => !["Resolved", "resolved", "Closed"].includes(c.status)).length;
    const escalated = complaints.filter(c => (c.priority_score || 0) > 80 && !["Resolved", "resolved", "Closed"].includes(c.status)).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgResTime = resolved > 0 ? Math.round(
        complaints.filter(c => ["Resolved", "resolved", "Closed"].includes(c.status) && c.updated_at)
            .reduce((sum, c) => sum + (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / 86400000, 0) / resolved
    ) : 0;

    // Category distribution
    const catMap: Record<string, number> = {};
    complaints.forEach(c => { const cat = c.category || "General"; catMap[cat] = (catMap[cat] || 0) + 1; });
    const catData = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    // Monthly trend (last 6 months)
    const monthMap: Record<string, { total: number; resolved: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthMap[key] = { total: 0, resolved: 0 };
    }
    complaints.forEach(c => {
        const d = new Date(c.created_at);
        const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        if (monthMap[key]) monthMap[key].total++;
        if (["Resolved", "resolved", "Closed"].includes(c.status)) {
            const ud = new Date(c.updated_at || c.created_at);
            const uk = ud.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            if (monthMap[uk]) monthMap[uk].resolved++;
        }
    });
    const monthData = Object.entries(monthMap);
    const maxMonthVal = Math.max(...monthData.map(([, v]) => v.total), 1);

    // Status breakdown
    const statusMap: Record<string, number> = {};
    complaints.forEach(c => { const s = c.status || "Submitted"; statusMap[s] = (statusMap[s] || 0) + 1; });

    const catColors = ["#C0392B", "#D4880F", "#2874A6", "#1E8449", "#7D3C98", "#5D6D7E", "#B8860B", "#A93226"];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center space-y-3">
                    <Loader2 className="size-8 animate-spin mx-auto" style={{ color: "#C0392B" }} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#B8860B" }}>Generating Executive Report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Executive Reports</h1>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wider">Rajasthan Civic Operations • Ministerial Brief</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border bg-white hover:bg-stone-50 transition-colors shadow-sm" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                        <Printer className="size-3" /> Print Report
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border bg-white hover:bg-stone-50 transition-colors shadow-sm" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                        <Download className="size-3" /> Download CSV
                    </button>
                </div>
            </div>

            {/* Executive Summary Bar */}
            <div className="bg-white rounded-sm border shadow-sm p-4" style={{ borderColor: "#E8DDD4" }}>
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="size-4" style={{ color: "#B8860B" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Executive Summary</span>
                    <span className="text-[10px] text-stone-400 ml-auto font-mono">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <StatBlock label="Total Complaints" value={total} color="#8B1A1A" icon={FileText} />
                    <StatBlock label="Resolution Rate" value={`${resolutionRate}%`} color="#1E8449" icon={CheckCircle2} />
                    <StatBlock label="Open Issues" value={open} color="#D4880F" icon={Clock} />
                    <StatBlock label="Escalated" value={escalated} color="#C0392B" icon={AlertTriangle} />
                    <StatBlock label="Avg Resolution" value={`${avgResTime}d`} color="#2874A6" icon={TrendingUp} />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* Monthly Trend */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <TrendingUp className="size-4" style={{ color: "#8B1A1A" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Monthly Trend</span>
                    </div>
                    <div className="p-4">
                        <div className="flex items-end gap-2 h-40">
                            {monthData.map(([month, { total: t, resolved: r }]) => (
                                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "120px" }}>
                                        <div className="w-full flex items-end gap-0.5 h-full">
                                            <div className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${(t / maxMonthVal) * 100}%`, background: "#8B1A1A", minHeight: t > 0 ? "4px" : "0" }} />
                                            <div className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${(r / maxMonthVal) * 100}%`, background: "#1E8449", minHeight: r > 0 ? "4px" : "0" }} />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-mono text-stone-400 uppercase">{month}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 pt-2 border-t" style={{ borderColor: "#F0E8E0" }}>
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-sm" style={{ background: "#8B1A1A" }} />
                                <span className="text-[10px] text-stone-500">Filed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-sm" style={{ background: "#1E8449" }} />
                                <span className="text-[10px] text-stone-500">Resolved</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <BarChart3 className="size-4" style={{ color: "#8B1A1A" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Category Distribution</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {catData.map(([cat, count], i) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            const color = catColors[i % catColors.length];
                            return (
                                <div key={cat}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-sm" style={{ background: color }} />
                                            <span className="text-[11px] font-semibold text-stone-600">{cat}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-stone-400 tabular-nums">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 rounded-sm overflow-hidden ml-4" style={{ background: "#F0E8E0" }}>
                                        <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                </div>
                            );
                        })}
                        {catData.length === 0 && <p className="text-xs text-stone-400 text-center py-6">No data available</p>}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* Status Breakdown */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <PieChart className="size-4" style={{ color: "#8B1A1A" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Status Breakdown</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {Object.entries(statusMap).map(([status, count]) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            const s = status.toLowerCase();
                            let color = "#D4880F";
                            if (s === "resolved" || s === "closed") color = "#1E8449";
                            else if (s === "in progress" || s === "in_progress") color = "#2874A6";
                            else if (s === "assigned") color = "#7D3C98";
                            return (
                                <div key={status} className="flex items-center gap-3">
                                    <div className="size-3 rounded-sm" style={{ background: color }} />
                                    <span className="text-[11px] font-semibold text-stone-600 flex-1 uppercase">{status.replace("_", " ")}</span>
                                    <span className="text-[11px] font-mono text-stone-500 tabular-nums">{count}</span>
                                    <span className="text-[10px] text-stone-400 w-10 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Indicators */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <Users className="size-4" style={{ color: "#8B1A1A" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Citizen Sentiment</span>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        {/* Gauge */}
                        <div className="relative w-32 h-16 mb-3">
                            <svg viewBox="0 0 120 60" className="w-full h-full">
                                <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="#F0E8E0" strokeWidth="10" strokeLinecap="round" />
                                <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="url(#gauge)" strokeWidth="10" strokeLinecap="round"
                                    strokeDasharray={`${resolutionRate * 1.57} 157`} />
                                <defs>
                                    <linearGradient id="gauge" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#C0392B" />
                                        <stop offset="50%" stopColor="#D4880F" />
                                        <stop offset="100%" stopColor="#1E8449" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                <span className="text-xl font-bold" style={{ color: "#3D2B1F" }}>{resolutionRate}</span>
                                <span className="text-[10px] text-stone-400">/100</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {resolutionRate >= 60 ? <ArrowUpRight className="size-3" style={{ color: "#1E8449" }} /> : <ArrowDownRight className="size-3" style={{ color: "#C0392B" }} />}
                            <span className="text-[11px] font-bold uppercase" style={{ color: resolutionRate >= 60 ? "#1E8449" : resolutionRate >= 40 ? "#D4880F" : "#C0392B" }}>
                                {resolutionRate >= 60 ? "Improving" : resolutionRate >= 40 ? "Stable" : "Declining"}
                            </span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 text-center">Based on resolution rate and response time</p>
                    </div>
                </div>

                {/* Operational Notes */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <Calendar className="size-4" style={{ color: "#B8860B" }} />
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Report Actions</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <button onClick={handlePrint} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-sm border hover:bg-stone-50 transition-colors" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                            <Printer className="size-4" style={{ color: "#8B1A1A" }} />
                            <div className="text-left flex-1">
                                <p>Generate PDF Report</p>
                                <p className="text-[10px] text-stone-400 font-normal">Print-optimized ministerial brief</p>
                            </div>
                        </button>
                        <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-sm border hover:bg-stone-50 transition-colors" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                            <Download className="size-4" style={{ color: "#1E8449" }} />
                            <div className="text-left flex-1">
                                <p>Download CSV Dataset</p>
                                <p className="text-[10px] text-stone-400 font-normal">Raw data for further analysis</p>
                            </div>
                        </button>
                        <div className="px-3 py-2.5 text-xs rounded-sm" style={{ background: "#FAF5F0", border: "1px solid #E8DDD4" }}>
                            <p className="font-semibold" style={{ color: "#B8860B" }}>Auto Email Reports</p>
                            <p className="text-[10px] text-stone-400 mt-0.5">Contact IT to schedule automated daily/weekly report emails to department heads.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Stat Block ── */
function StatBlock({ label, value, color, icon: Icon }: { label: string; value: number | string; color: string; icon: any }) {
    return (
        <div className="text-center px-3 py-2.5 rounded-sm" style={{ background: "#FAF5F0" }}>
            <Icon className="size-4 mx-auto mb-1.5" style={{ color }} />
            <p className="text-xl font-bold tabular-nums" style={{ color: "#3D2B1F" }}>{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color }}>{label}</p>
        </div>
    );
}
