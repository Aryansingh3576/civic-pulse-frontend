"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, AlertTriangle, CheckCircle2, MapPin, ArrowUpCircle,
    Clock, Camera, Eye, Timer, Loader2, Activity, Shield, Zap,
    BarChart3, ChevronRight, Radio, Users, Siren, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import Link from "next/link";

/* ── Helpers ── */
function getTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function getPriorityConfig(score: number) {
    if (score > 80) return { label: "CRITICAL", color: "#C0392B", bg: "#FDEDEC", border: "#E6B0AA" };
    if (score > 60) return { label: "HIGH", color: "#D4880F", bg: "#FEF5E7", border: "#F9E79F" };
    if (score > 40) return { label: "MEDIUM", color: "#2874A6", bg: "#EBF5FB", border: "#AED6F1" };
    return { label: "LOW", color: "#1E8449", bg: "#EAFAF1", border: "#A9DFBF" };
}

function getStatusConfig(status: string) {
    const s = status?.toLowerCase();
    if (s === "resolved" || s === "closed") return { label: "RESOLVED", color: "#1E8449", bg: "#EAFAF1" };
    if (s === "in progress" || s === "in_progress") return { label: "IN PROGRESS", color: "#2874A6", bg: "#EBF5FB" };
    if (s === "assigned") return { label: "ASSIGNED", color: "#7D3C98", bg: "#F5EEF8" };
    return { label: "SUBMITTED", color: "#D4880F", bg: "#FEF5E7" };
}

export default function AdminDashboard() {
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

    const total = complaints.length;
    const critical = complaints.filter(c => (c.priority_score || 0) > 80 && !["Resolved", "resolved", "Closed"].includes(c.status)).length;
    const resolved = complaints.filter(c => ["Resolved", "resolved", "Closed"].includes(c.status)).length;
    const inProgress = complaints.filter(c => c.status === "In Progress" || c.status === "in_progress").length;
    const pending = complaints.filter(c => ["Submitted", "submitted", "Assigned", "assigned"].includes(c.status)).length;

    const slaBreach = complaints.filter(c => {
        if (["Resolved", "resolved", "Closed"].includes(c.status)) return false;
        if (c.sla_deadline) return new Date(c.sla_deadline).getTime() < Date.now() + 86400000;
        return (Date.now() - new Date(c.created_at).getTime()) / 86400000 > 2;
    }).length;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const resolvedToday = complaints.filter(c =>
        ["Resolved", "resolved", "Closed"].includes(c.status) && c.updated_at && new Date(c.updated_at) >= todayStart
    ).length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const recentTickets = [...complaints]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 12);

    const escalations = complaints
        .filter(c => !["Resolved", "resolved", "Closed"].includes(c.status) && (Date.now() - new Date(c.created_at).getTime()) / 86400000 > 3)
        .sort((a, b) => (b.priority_score || 50) - (a.priority_score || 50))
        .slice(0, 6);

    const catMap: Record<string, number> = {};
    complaints.forEach(c => { const cat = c.category || "General"; catMap[cat] = (catMap[cat] || 0) + 1; });
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const proofItems = complaints
        .filter(c => ["Resolved", "resolved", "Closed"].includes(c.status))
        .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
        .slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center space-y-3">
                    <Loader2 className="size-8 animate-spin mx-auto" style={{ color: "#C0392B" }} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#B8860B" }}>Loading Operational Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* ═══ STRATEGIC OVERVIEW METRICS ═══ */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <MetricCard label="TOTAL ACTIVE" value={total - resolved} sub={`${total} all-time`} color="#8B1A1A" icon={Activity} />
                <MetricCard label="CRITICAL INCIDENTS" value={critical} sub={critical > 0 ? "Immediate attention" : "None active"} color="#C0392B" icon={Siren} alert={critical > 0} />
                <MetricCard label="SLA BREACH RISK" value={slaBreach} sub="Approaching deadline" color="#D4880F" icon={Timer} />
                <MetricCard label="RESOLVED TODAY" value={resolvedToday} sub={`${resolutionRate}% overall rate`} color="#1E8449" icon={CheckCircle2} />
                <MetricCard label="IN PROGRESS" value={inProgress} sub={`${pending} awaiting action`} color="#2874A6" icon={BarChart3} />
            </div>

            {/* ═══ MAIN OPERATIONS GRID ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

                {/* LEFT: Ticket Queue (60%) */}
                <div className="lg:col-span-3 bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center gap-2">
                            <Shield className="size-4" style={{ color: "#8B1A1A" }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Ticket Queue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-sm" style={{ background: "#FEF5E7", color: "#B8860B" }}>
                                {recentTickets.length} entries
                            </span>
                            <Link href="/admin/complaints" className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-0.5" style={{ color: "#8B1A1A" }}>
                                View All <ChevronRight className="size-3" />
                            </Link>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ background: "#FAF5F0" }}>
                                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Priority</th>
                                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Complaint</th>
                                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Status</th>
                                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Age</th>
                                    <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Location</th>
                                    <th className="text-right px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTickets.map((t) => {
                                    const pri = getPriorityConfig(t.priority_score || 50);
                                    const st = getStatusConfig(t.status);
                                    const daysOld = Math.floor((Date.now() - new Date(t.created_at).getTime()) / 86400000);
                                    return (
                                        <tr key={t.id} className="border-t hover:bg-stone-50/50 transition-colors" style={{ borderColor: "#F0E8E0" }}>
                                            <td className="px-4 py-2">
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border" style={{ color: pri.color, background: pri.bg, borderColor: pri.border }}>
                                                    {pri.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <p className="text-xs font-medium text-stone-800 truncate max-w-[200px]">{t.title}</p>
                                                <p className="text-[10px] font-mono text-stone-400">#{String(t.id).slice(-8)}</p>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm" style={{ color: st.color, background: st.bg }}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={cn("text-[11px] font-mono tabular-nums", daysOld > 3 ? "text-red-600 font-bold" : "text-stone-500")}>
                                                    {daysOld > 0 ? `${daysOld}d` : getTimeAgo(t.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-[11px] text-stone-400 max-w-[120px] truncate">
                                                {t.address ? <span className="flex items-center gap-1"><MapPin className="size-3 shrink-0" />{t.address.split(",")[0]}</span> : "—"}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <Link href={`/admin/complaints/${t.id}`} className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#8B1A1A" }}>
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: Live Feed (40%) */}
                <div className="lg:col-span-2 bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center gap-2">
                            <Radio className="size-4 text-red-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Active Incidents — Live</span>
                        </div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: "420px" }}>
                        {recentTickets.slice(0, 10).map((t) => {
                            const pri = getPriorityConfig(t.priority_score || 50);
                            const st = getStatusConfig(t.status);
                            return (
                                <Link key={t.id} href={`/admin/complaints/${t.id}`}>
                                    <div className="px-4 py-2.5 border-b hover:bg-stone-50 transition-colors cursor-pointer" style={{ borderColor: "#F0E8E0" }}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full" style={{ background: pri.color }} />
                                                <span className="text-[10px] font-mono text-stone-400">{getTimeAgo(t.created_at)}</span>
                                            </div>
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm" style={{ color: st.color, background: st.bg }}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-stone-700 truncate">{t.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-stone-400">{t.category || "General"}</span>
                                            {t.address && <span className="text-[10px] text-stone-300 truncate flex items-center gap-0.5"><MapPin className="size-2.5" />{t.address.split(",")[0]}</span>}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="px-4 py-2.5 border-t flex gap-2" style={{ borderColor: "#E8DDD4" }}>
                        <Link href="/admin/complaints" className="flex-1 text-center text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-sm border hover:bg-stone-50 transition-colors" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                            View All
                        </Link>
                        <Link href="/admin/complaints" className="flex-1 text-center text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-sm border hover:bg-stone-50 transition-colors" style={{ borderColor: "#E8DDD4", color: "#D4880F" }}>
                            Escalation Queue
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ TACTICAL ANALYTICS FOOTER ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* Escalation Alerts */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle className="size-4 text-red-600" />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Escalation Alerts</span>
                        </div>
                        <span className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-sm" style={{ background: "#FDEDEC", color: "#C0392B" }}>
                            {escalations.length}
                        </span>
                    </div>
                    <div>
                        {escalations.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <CheckCircle2 className="size-6 mx-auto mb-2" style={{ color: "#1E8449" }} />
                                <p className="text-xs text-stone-400 uppercase tracking-wider">No Overdue Complaints</p>
                            </div>
                        ) : escalations.map(c => {
                            const days = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
                            return (
                                <Link key={c.id} href={`/admin/complaints/${c.id}`}>
                                    <div className="px-4 py-2.5 hover:bg-stone-50 transition-colors flex items-center gap-3 border-t" style={{ borderColor: "#F0E8E0" }}>
                                        <AlertTriangle className="size-3.5 text-red-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-stone-700 truncate">{c.title}</p>
                                            <p className="text-[10px] text-stone-400">{c.category || "General"} • {days}d overdue</p>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold tabular-nums text-red-600">{c.priority_score || 50}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4" style={{ color: "#8B1A1A" }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Category Distribution</span>
                        </div>
                    </div>
                    <div className="px-4 py-3 space-y-2.5">
                        {topCats.map(([cat, count]) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={cat}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">{cat}</span>
                                        <span className="text-[10px] font-mono text-stone-400 tabular-nums">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-1.5 rounded-sm overflow-hidden" style={{ background: "#F0E8E0" }}>
                                        <div className="h-full rounded-sm transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C0392B, #8B1A1A)" }} />
                                    </div>
                                </div>
                            );
                        })}
                        {topCats.length === 0 && (
                            <p className="text-xs text-stone-400 text-center py-4">No data available</p>
                        )}
                    </div>
                </div>

                {/* Resolution Verification */}
                <div className="bg-white rounded-sm border shadow-sm" style={{ borderColor: "#E8DDD4" }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center gap-2">
                            <Camera className="size-4" style={{ color: "#1E8449" }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Resolution Verification</span>
                        </div>
                        <span className="text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-sm" style={{ background: "#EAFAF1", color: "#1E8449" }}>
                            {proofItems.length}
                        </span>
                    </div>
                    <div>
                        {proofItems.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Camera className="size-6 text-stone-300 mx-auto mb-2" />
                                <p className="text-xs text-stone-400 uppercase tracking-wider">No Resolved Complaints</p>
                            </div>
                        ) : proofItems.map(c => (
                            <Link key={c.id} href={`/admin/complaints/${c.id}`}>
                                <div className="px-4 py-2.5 hover:bg-stone-50 transition-colors flex items-center gap-3 border-t" style={{ borderColor: "#F0E8E0" }}>
                                    {c.resolution_photo_url ? (
                                        <div className="size-8 rounded-sm overflow-hidden shrink-0 border" style={{ borderColor: "#E8DDD4" }}>
                                            <img src={c.resolution_photo_url} alt="" className="size-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="size-8 rounded-sm flex items-center justify-center shrink-0" style={{ background: "#FAF5F0" }}>
                                            <Camera className="size-3.5 text-stone-300" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-stone-700 truncate">{c.title}</p>
                                        <p className="text-[10px] text-stone-400">{c.resolution_photo_url ? "Photo verified" : "No proof"} • {getTimeAgo(c.updated_at || c.created_at)}</p>
                                    </div>
                                    {c.resolution_photo_url ? (
                                        <CheckCircle2 className="size-3.5 shrink-0" style={{ color: "#1E8449" }} />
                                    ) : (
                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm" style={{ color: "#D4880F", background: "#FEF5E7" }}>Pending</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Metric Card ── */
function MetricCard({ label, value, sub, color, icon: Icon, alert }: {
    label: string; value: number; sub: string; color: string; icon: any; alert?: boolean;
}) {
    return (
        <div className="bg-white rounded-sm border px-4 py-3 shadow-sm" style={{ borderColor: "#E8DDD4" }}>
            <div className="flex items-center justify-between mb-2">
                <Icon className="size-4" style={{ color }} />
                {alert && <div className="size-2 rounded-full animate-pulse" style={{ background: color }} />}
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: "#3D2B1F" }}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color }}>{label}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>
        </div>
    );
}
