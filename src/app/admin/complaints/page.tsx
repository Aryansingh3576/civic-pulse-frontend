"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
    Search, AlertTriangle, Loader2, MapPin, Eye, CheckCircle2,
    X, Camera, Upload, FileText, Zap, Users, Activity, Timer,
    ArrowUpCircle, Shield, Clock, Download, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

/* ── Helpers ── */
function compressAndConvertToBase64(file: File, maxDim = 1200, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let w = img.width, h = img.height;
                if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w *= r; h *= r; }
                canvas.width = w; canvas.height = h;
                canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function getTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

function getSLACountdown(c: any) {
    if (c.sla_deadline) {
        const remaining = new Date(c.sla_deadline).getTime() - Date.now();
        if (remaining < 0) return { text: "BREACHED", color: "#C0392B" };
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        if (hours < 6) return { text: `${hours}h ${mins}m`, color: "#C0392B" };
        if (hours < 24) return { text: `${hours}h ${mins}m`, color: "#D4880F" };
        return { text: `${hours}h`, color: "#1E8449" };
    }
    const d = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
    if (d > 5) return { text: `${d}d overdue`, color: "#C0392B" };
    if (d > 3) return { text: `${d}d`, color: "#D4880F" };
    return { text: `${d}d`, color: "#7F8C8D" };
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

const statusFilters = [
    { id: "all", label: "All" },
    { id: "submitted", label: "New" },
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "Active" },
    { id: "resolved", label: "Resolved" },
];

const priorityFilters = [
    { id: "all", label: "All Priority" },
    { id: "critical", label: "Critical" },
    { id: "high", label: "High" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low" },
];

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [resolveModalId, setResolveModalId] = useState<string | null>(null);
    const [resolvePhoto, setResolvePhoto] = useState<string | null>(null);
    const [resolvePhotoPreview, setResolvePhotoPreview] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [resolveError, setResolveError] = useState("");
    const resolveFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchComplaints(); }, []);

    async function fetchComplaints() {
        try {
            const res = await api.get("/complaints");
            setComplaints(res.data?.data?.complaints || []);
        } catch (e) { console.error("Fetch failed", e); }
        finally { setLoading(false); }
    }

    async function handleStatusUpdate(id: string, newStatus: string) {
        if (newStatus === "Resolved") {
            setResolveModalId(id); setResolvePhoto(null); setResolvePhotoPreview(null); setResolveError("");
            return;
        }
        try {
            const token = localStorage.getItem("admin_token");
            await api.patch(`/complaints/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (e) { console.error("Status update failed", e); }
    }

    async function handleResolvePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setResolvePhotoPreview(URL.createObjectURL(file));
        try { setResolvePhoto(await compressAndConvertToBase64(file, 800, 0.6)); setResolveError(""); } catch { setResolveError("Failed to process image"); }
    }

    async function confirmResolve() {
        if (!resolvePhoto || !resolveModalId) { setResolveError("Resolution photo is required"); return; }
        setIsResolving(true);
        try {
            const token = localStorage.getItem("admin_token");
            await api.patch(`/complaints/${resolveModalId}/status`, { status: "Resolved", resolution_photo_url: resolvePhoto }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaints(prev => prev.map(c => c.id === resolveModalId ? { ...c, status: "Resolved" } : c));
            closeResolveModal();
        } catch { setResolveError("Failed to resolve"); }
        finally { setIsResolving(false); }
    }

    function closeResolveModal() { setResolveModalId(null); setResolvePhoto(null); setResolvePhotoPreview(null); setResolveError(""); }

    function toggleSelect(id: string) {
        setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
    function toggleSelectAll() {
        selectedIds.size === filtered.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filtered.map(c => c.id)));
    }

    function exportCSV() {
        const rows = filtered.map(c => ({
            ID: c.id, Title: c.title, Status: c.status, Category: c.category || "General",
            Priority: c.priority_score || 50, Address: c.address || "", Created: c.created_at,
        }));
        const header = Object.keys(rows[0] || {}).join(",");
        const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `complaints_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    }

    async function bulkUpdateStatus(newStatus: string) {
        const token = localStorage.getItem("admin_token");
        for (const id of selectedIds) {
            try { await api.patch(`/complaints/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } }); } catch { }
        }
        setSelectedIds(new Set()); fetchComplaints();
    }

    const filtered = complaints.filter(c => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || c.title?.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q) || String(c.id).includes(q);
        let matchStatus = statusFilter === "all";
        if (!matchStatus) {
            const s = c.status?.toLowerCase();
            if (statusFilter === "submitted") matchStatus = s === "submitted";
            else if (statusFilter === "assigned") matchStatus = s === "assigned";
            else if (statusFilter === "in_progress") matchStatus = s === "in progress" || s === "in_progress";
            else if (statusFilter === "resolved") matchStatus = s === "resolved" || s === "closed";
        }
        let matchPri = priorityFilter === "all";
        if (!matchPri) {
            const score = c.priority_score || 50;
            if (priorityFilter === "critical") matchPri = score > 80;
            else if (priorityFilter === "high") matchPri = score > 60 && score <= 80;
            else if (priorityFilter === "medium") matchPri = score > 40 && score <= 60;
            else if (priorityFilter === "low") matchPri = score <= 40;
        }
        return matchSearch && matchStatus && matchPri;
    });

    const total = complaints.length;
    const critCount = complaints.filter(c => (c.priority_score || 0) > 80 && !["Resolved", "resolved", "Closed"].includes(c.status)).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="text-center space-y-3">
                    <Loader2 className="size-8 animate-spin mx-auto" style={{ color: "#C0392B" }} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#B8860B" }}>Loading Complaint Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-lg font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Complaint Registry</h1>
                    <p className="text-[11px] text-stone-400 uppercase tracking-wider">{total} total • {critCount} critical • {filtered.length} shown</p>
                </div>
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border bg-white hover:bg-stone-50 transition-colors shadow-sm" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>
                    <Download className="size-3" /> Export CSV
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-sm border shadow-sm p-2.5 flex flex-wrap gap-2 items-center" style={{ borderColor: "#E8DDD4" }}>
                <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ID, title, location..."
                        className="w-full h-7 pl-7 pr-8 text-xs rounded-sm border outline-none" style={{ background: "#FAF5F0", borderColor: "#E8DDD4", color: "#3D2B1F" }} />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="size-3 text-stone-400" /></button>}
                </div>

                <div className="flex items-center gap-0.5">
                    {statusFilters.map(f => (
                        <button key={f.id} onClick={() => setStatusFilter(f.id)}
                            className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors",
                                statusFilter === f.id ? "text-white shadow-sm" : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                            )}
                            style={statusFilter === f.id ? { background: "#8B1A1A" } : {}}>
                            {f.label}
                        </button>
                    ))}
                </div>

                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                    className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border outline-none cursor-pointer"
                    style={{ background: "#FAF5F0", borderColor: "#E8DDD4", color: "#5D4037" }}>
                    {priorityFilters.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>

                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] font-mono mr-1" style={{ color: "#8B1A1A" }}>{selectedIds.size} selected</span>
                        <button onClick={() => bulkUpdateStatus("In Progress")} className="px-2 py-1 text-[10px] font-bold uppercase rounded-sm" style={{ background: "#EBF5FB", color: "#2874A6" }}>Assign</button>
                        <button onClick={() => bulkUpdateStatus("Resolved")} className="px-2 py-1 text-[10px] font-bold uppercase rounded-sm" style={{ background: "#EAFAF1", color: "#1E8449" }}>Resolve</button>
                    </div>
                )}
            </div>

            {/* Command Table */}
            <div className="bg-white rounded-sm border shadow-sm overflow-hidden" style={{ borderColor: "#E8DDD4" }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr style={{ background: "#FAF5F0" }}>
                                <th className="w-8 px-3 py-2">
                                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="size-3.5 rounded-sm cursor-pointer accent-red-800" />
                                </th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Priority</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">ID</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Title</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Category</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">SLA Timer</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Status</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Location</th>
                                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Last</th>
                                <th className="text-right px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={10} className="h-24 text-center text-stone-400 text-xs uppercase tracking-wider">No complaints match filters</td></tr>
                            ) : filtered.map((c) => {
                                const pri = getPriorityConfig(c.priority_score || 50);
                                const st = getStatusConfig(c.status);
                                const sla = getSLACountdown(c);
                                const isSelected = selectedIds.has(c.id);
                                const isResolved = ["Resolved", "resolved", "Closed"].includes(c.status);
                                return (
                                    <tr key={c.id} className={cn("border-t hover:bg-stone-50/50 transition-colors", isSelected && "bg-red-50/40")} style={{ borderColor: "#F0E8E0" }}>
                                        <td className="px-3 py-2"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(c.id)} className="size-3.5 rounded-sm cursor-pointer accent-red-800" /></td>
                                        <td className="px-3 py-2">
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border whitespace-nowrap" style={{ color: pri.color, background: pri.bg, borderColor: pri.border }}>{pri.label}</span>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-[10px] text-stone-400">#{String(c.id).slice(-8)}</td>
                                        <td className="px-3 py-2">
                                            <Link href={`/admin/complaints/${c.id}`} className="text-xs font-medium text-stone-700 hover:underline truncate block max-w-[200px]" style={{ textDecorationColor: "#8B1A1A" }}>
                                                {c.title}
                                            </Link>
                                        </td>
                                        <td className="px-3 py-2 text-[11px] text-stone-500">{c.category || "General"}</td>
                                        <td className="px-3 py-2">
                                            <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: isResolved ? "#BDC3C7" : sla.color }}>
                                                {isResolved ? "—" : sla.text}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm whitespace-nowrap" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                                        </td>
                                        <td className="px-3 py-2 text-[10px] text-stone-400 max-w-[120px] truncate">{c.address ? c.address.split(",")[0] : "—"}</td>
                                        <td className="px-3 py-2 text-[10px] font-mono text-stone-400 tabular-nums">{getTimeAgo(c.updated_at || c.created_at)}</td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/admin/complaints/${c.id}`}>
                                                    <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-stone-100 transition-colors" style={{ color: "#8B1A1A" }}>View</button>
                                                </Link>
                                                {!isResolved && (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(c.id, "In Progress")} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-blue-50 transition-colors text-blue-700">Assign</button>
                                                        <button onClick={() => handleStatusUpdate(c.id, "Resolved")} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-emerald-50 transition-colors text-emerald-700">Resolve</button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolution Photo Modal */}
            {resolveModalId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(61,43,31,0.5)" }}>
                    <div className="w-full max-w-md rounded-sm border p-5 mx-4 bg-white shadow-xl" style={{ borderColor: "#E8DDD4" }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#3D2B1F" }}>Resolution Verification</h3>
                            <button onClick={closeResolveModal} className="p-1 hover:bg-stone-100 rounded-sm"><X className="size-4 text-stone-400" /></button>
                        </div>
                        <p className="text-xs text-stone-500 mb-4">Upload photographic evidence of the resolved issue to complete verification.</p>
                        <input type="file" ref={resolveFileRef} accept="image/*" onChange={handleResolvePhotoChange} className="hidden" />
                        {resolvePhotoPreview ? (
                            <div className="mb-4">
                                <div className="rounded-sm overflow-hidden border mb-2" style={{ borderColor: "#E8DDD4" }}>
                                    <img src={resolvePhotoPreview} alt="Resolution" className="w-full h-48 object-cover" />
                                </div>
                                <button onClick={() => resolveFileRef.current?.click()} className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#8B1A1A" }}>Replace Image</button>
                            </div>
                        ) : (
                            <button onClick={() => resolveFileRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed rounded-sm flex flex-col items-center justify-center gap-2 hover:bg-stone-50 transition-colors mb-4"
                                style={{ borderColor: "#D5C4B3" }}>
                                <Camera className="size-6 text-stone-300" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Upload Resolution Photo</span>
                            </button>
                        )}
                        {resolveError && <p className="text-xs text-red-600 mb-3">{resolveError}</p>}
                        <div className="flex gap-2">
                            <button onClick={closeResolveModal} className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm border hover:bg-stone-50" style={{ borderColor: "#E8DDD4", color: "#5D4037" }}>Cancel</button>
                            <button onClick={confirmResolve} disabled={!resolvePhoto || isResolving}
                                className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors", resolvePhoto ? "text-white" : "text-stone-400 cursor-not-allowed")}
                                style={{ background: resolvePhoto ? "#1E8449" : "#E8DDD4" }}>
                                {isResolving ? "Processing..." : "Confirm Resolution"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
