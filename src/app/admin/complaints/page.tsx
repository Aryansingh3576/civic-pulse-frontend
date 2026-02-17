"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Search, AlertTriangle, Loader2, MapPin, Eye, CheckCircle2,
    Clock, FileText, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";

function normalizeStatus(s: string): string {
    const map: Record<string, string> = { Submitted: "submitted", "In Progress": "in_progress", Resolved: "resolved", Closed: "resolved", Assigned: "assigned", Verified: "verified" };
    return map[s] || s.toLowerCase();
}

const statusFilters = [
    { id: "all", label: "All" }, { id: "submitted", label: "Submitted" },
    { id: "assigned", label: "Assigned" }, { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
];

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => { fetchComplaints(); }, []);

    async function fetchComplaints() {
        try {
            const res = await api.get("/complaints");
            setComplaints(res.data?.data?.complaints || []);
        } catch (e) { console.error("Failed to fetch complaints", e); }
        finally { setLoading(false); }
    }

    async function handleStatusUpdate(id: number, newStatus: string) {
        try {
            const token = localStorage.getItem("admin_token");
            await api.patch(`/complaints/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
        } catch (e) { console.error("Failed to update status", e); }
    }

    const filtered = complaints.filter((c) => {
        const norm = normalizeStatus(c.status || "submitted");
        if (statusFilter !== "all" && norm !== statusFilter) return false;
        if (searchQuery && !c.title?.toLowerCase().includes(searchQuery.toLowerCase()) && !c.address?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: complaints.length,
        pending: complaints.filter((c) => c.status === "Submitted" || c.status === "submitted").length,
        resolved: complaints.filter((c) => c.status === "Resolved" || c.status === "resolved" || c.status === "Closed").length,
        critical: complaints.filter((c) => (c.priority_score || 0) > 80).length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
                    Complaint <span className="gradient-text">Management</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">View, filter, and manage all citizen complaints.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total", value: stats.total, color: "text-blue-500 bg-blue-500/10", icon: FileText },
                    { label: "Pending", value: stats.pending, color: "text-amber-500 bg-amber-500/10", icon: Clock },
                    { label: "Resolved", value: stats.resolved, color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle2 },
                    { label: "Critical", value: stats.critical, color: "text-rose-500 bg-rose-500/10", icon: AlertTriangle },
                ].map((s) => (
                    <Card key={s.label} className="glass-card border-border/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", s.color)}><s.icon className="size-4" /></div>
                            <div>
                                <p className="text-xl font-bold tabular-nums">{s.value}</p>
                                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input placeholder="Search by title or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card/50 border border-border/30 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {statusFilters.map((f) => (
                        <button key={f.id} onClick={() => setStatusFilter(f.id)}
                            className={cn("px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                statusFilter === f.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted border border-transparent")}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card className="glass-card border-border/20">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><FileText className="size-5 text-primary" /> All Complaints</CardTitle>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{filtered.length} results</Badge>
                </CardHeader>
                <CardContent>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-border/20">
                                    <TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Location</TableHead>
                                    <TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="size-5 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No complaints found</TableCell></TableRow>
                                ) : filtered.map((r: any) => {
                                    const score = r.priority_score || 50;
                                    return (
                                        <TableRow key={r.id} className="hover:bg-card/30 border-border/10">
                                            <TableCell className="font-mono text-xs text-muted-foreground">#{r.id}</TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{r.category || "General"}</TableCell>
                                            <TableCell><StatusBadge status={normalizeStatus(r.status)} /></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-14 bg-muted/30 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full", score > 70 ? "bg-rose-500" : score > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${score}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground tabular-nums">{score}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs max-w-[150px] truncate">
                                                <div className="flex items-center gap-1"><MapPin className="size-3 shrink-0" /><span className="truncate">{r.address || "Unknown"}</span></div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass-card">
                                                        <DropdownMenuItem asChild><Link href={`/admin/complaints/${r.id}`}><Eye className="mr-2 size-4" /> View Details</Link></DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "In Progress")}><Clock className="mr-2 size-4" /> Mark In Progress</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, "Resolved")}><CheckCircle2 className="mr-2 size-4" /> Mark Resolved</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {loading ? (<div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-primary" /></div>)
                            : filtered.length === 0 ? (<p className="text-center text-muted-foreground py-12">No complaints found</p>)
                                : filtered.map((r: any) => {
                                    const score = r.priority_score || 50;
                                    return (
                                        <Link key={r.id} href={`/admin/complaints/${r.id}`}>
                                            <div className="p-4 rounded-xl border border-border/20 bg-card/30 hover:bg-card/50 transition-colors space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-sm truncate">{r.title}</h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="size-3 shrink-0" /><span className="truncate">{r.address || "Unknown"}</span></p>
                                                    </div>
                                                    <StatusBadge status={normalizeStatus(r.status)} />
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{r.category || "General"}</span>
                                                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 flex-1 bg-muted/30 rounded-full overflow-hidden">
                                                        <div className={cn("h-full rounded-full", score > 70 ? "bg-rose-500" : score > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${score}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground tabular-nums">{score}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
