"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, MapPin, Clock, CheckCircle2, UserCheck, ShieldCheck,
    Send, TrendingUp, AlertTriangle, Calendar, Tag, Building2,
    ThumbsUp, Loader2, ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";

interface ComplaintDetail {
    id: number; title: string; description: string; status: string;
    priority: string; priority_score: number; address: string;
    photo_url: string | null; upvotes: number; latitude: number | null;
    longitude: number | null; category: string; department: string;
    sla_hours: number; reporter_name: string; reporter_email: string;
    resolution_photo_url: string | null; resolution_type: string | null;
    is_escalated: number; created_at: string; updated_at: string;
}

const timelineSteps = [
    { key: "submitted", label: "Submitted", icon: Send },
    { key: "assigned", label: "Assigned", icon: UserCheck },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "resolved", label: "Resolved", icon: CheckCircle2 },
    { key: "verified", label: "Verified", icon: ShieldCheck },
];

const statusOptions = ["Submitted", "Assigned", "In Progress", "Resolved", "Closed"];

function normalizeStatus(s: string): string {
    const map: Record<string, string> = { Submitted: "submitted", "In Progress": "in_progress", Resolved: "resolved", Closed: "resolved", Assigned: "assigned", Verified: "verified" };
    return map[s] || s.toLowerCase();
}

function getTimelineIndex(s: string) {
    const idx = timelineSteps.findIndex((t) => t.key === s);
    return idx >= 0 ? idx : 0;
}

function getPriorityInfo(score: number) {
    if (score > 70) return { label: "High", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    if (score > 40) return { label: "Medium", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { label: "Low", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
}

export default function AdminComplaintDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetch() {
            try {
                const res = await api.get(`/complaints/${params.id}`);
                setComplaint(res.data?.data?.complaint);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load complaint.");
            } finally { setLoading(false); }
        }
        if (params.id) fetch();
    }, [params.id]);

    async function handleStatusUpdate(newStatus: string) {
        if (!complaint) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem("admin_token");
            await api.patch(`/complaints/${complaint.id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setComplaint({ ...complaint, status: newStatus, updated_at: new Date().toISOString() });
        } catch (e) { console.error("Failed to update", e); }
        finally { setUpdating(false); }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="size-10 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading complaint…</p>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <AlertTriangle className="size-12 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-bold">Complaint Not Found</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => router.push("/admin/complaints")} variant="outline" className="rounded-xl">
                        <ArrowLeft className="mr-2 size-4" /> Back to Complaints
                    </Button>
                </div>
            </div>
        );
    }

    const normalized = normalizeStatus(complaint.status);
    const currentIdx = getTimelineIndex(normalized);
    const priority = getPriorityInfo(complaint.priority_score || 50);
    const daysOld = Math.floor((Date.now() - new Date(complaint.created_at).getTime()) / 86400000);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Button variant="ghost" onClick={() => router.push("/admin/complaints")} className="-ml-2 mb-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 size-4" /> Back to Complaints
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-outfit)]">{complaint.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="font-mono text-xs">#{complaint.id}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1"><Calendar className="size-3.5" />{new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{daysOld}d ago</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs px-3 py-1 rounded-full border", priority.color)}>{priority.label} Priority</Badge>
                    <StatusBadge status={normalized} />
                    {/* Status update dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="rounded-xl gap-1.5" disabled={updating}>
                                {updating ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronDown className="size-3.5" />}
                                Update Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card">
                            {statusOptions.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusUpdate(s)} className={complaint.status === s ? "bg-primary/10 text-primary" : ""}>
                                    {s === "Resolved" && <CheckCircle2 className="mr-2 size-4" />}
                                    {s === "In Progress" && <Clock className="mr-2 size-4" />}
                                    {s === "Assigned" && <UserCheck className="mr-2 size-4" />}
                                    {s === "Submitted" && <Send className="mr-2 size-4" />}
                                    {s === "Closed" && <ShieldCheck className="mr-2 size-4" />}
                                    {s}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Timeline */}
            <Card className="glass-card border-border/20">
                <CardContent className="pt-6 pb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Status Timeline</h3>
                    <div className="flex items-center gap-1">
                        {timelineSteps.map((step, i) => {
                            const Icon = step.icon;
                            const isCompleted = i <= currentIdx;
                            const isActive = i === currentIdx;
                            return (
                                <div key={step.key} className="flex items-center gap-2 flex-1">
                                    <div className={cn("flex items-center justify-center size-9 sm:size-10 rounded-full transition-all shrink-0",
                                        isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : isCompleted ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground/30")}>
                                        <Icon className="size-4 sm:size-5" />
                                    </div>
                                    <span className={cn("text-[10px] sm:text-xs font-medium whitespace-nowrap hidden md:block",
                                        isActive ? "text-primary" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/30")}>{step.label}</span>
                                    {i < timelineSteps.length - 1 && (
                                        <div className={cn("flex-1 h-0.5 rounded-full mx-1", isCompleted && i < currentIdx ? "bg-primary/40" : "bg-muted/30")} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <Card className="glass-card border-border/20">
                        <CardContent className="pt-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Description</h3>
                            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{complaint.description || "No description provided."}</p>
                        </CardContent>
                    </Card>

                    {/* Photo */}
                    {complaint.photo_url && (
                        <Card className="glass-card border-border/20 overflow-hidden">
                            <CardContent className="pt-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Photo Evidence</h3>
                                <div className="rounded-xl overflow-hidden border border-border/20">
                                    <img src={complaint.photo_url} alt="Issue" className="w-full h-auto max-h-96 object-contain bg-muted/10" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="glass-card border-border/20">
                        <CardContent className="pt-6 space-y-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3"><Tag className="size-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Category</p><p className="text-sm font-medium">{complaint.category || "General"}</p></div></div>
                                {complaint.department && <div className="flex items-start gap-3"><Building2 className="size-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Department</p><p className="text-sm font-medium">{complaint.department}</p></div></div>}
                                <div className="flex items-start gap-3"><MapPin className="size-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium break-words">{complaint.address || "Unknown"}</p></div></div>
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Priority Score</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-20 bg-muted/30 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", (complaint.priority_score || 0) > 70 ? "bg-rose-500" : (complaint.priority_score || 0) > 40 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${complaint.priority_score || 0}%` }} />
                                            </div>
                                            <span className="text-sm font-medium tabular-nums">{complaint.priority_score || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3"><ThumbsUp className="size-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">Upvotes</p><p className="text-sm font-medium">{complaint.upvotes || 0}</p></div></div>
                                {complaint.sla_hours && <div className="flex items-start gap-3"><Clock className="size-4 text-primary mt-0.5 shrink-0" /><div><p className="text-xs text-muted-foreground">SLA</p><p className="text-sm font-medium">{complaint.sla_hours}h</p></div></div>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-border/20">
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Reporter</h3>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">{complaint.reporter_name?.substring(0, 2).toUpperCase() || "??"}</div>
                                <div><p className="text-sm font-medium">{complaint.reporter_name || "Anonymous"}</p><p className="text-xs text-muted-foreground">{complaint.reporter_email || ""}</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-border/20">
                        <CardContent className="pt-6 space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Activity</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium">{new Date(complaint.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span className="font-medium">{new Date(complaint.updated_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
