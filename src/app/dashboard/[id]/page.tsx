"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Clock,
    CheckCircle2,
    UserCheck,
    ShieldCheck,
    Send,
    TrendingUp,
    AlertTriangle,
    Calendar,
    Tag,
    Building2,
    ThumbsUp,
    Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/grid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";
import Footer from "@/components/footer";
import SlaTimer from "@/components/sla-timer";

interface ComplaintDetail {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    priority_score: number;
    address: string;
    photo_url: string | null;
    upvotes: number;
    latitude: number | null;
    longitude: number | null;
    category: string;
    department: string;
    sla_hours: number;
    sla_deadline?: string;
    resolution_photo_url?: string;
    resolved_at?: string;
    reporter_name: string;
    reporter_email: string;
    created_at: string;
    updated_at: string;
    fraud_flags?: { type: string; message: string }[];
}

const timelineSteps = [
    { key: "submitted", label: "Submitted", icon: Send },
    { key: "assigned", label: "Assigned", icon: UserCheck },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "resolved", label: "Resolved", icon: CheckCircle2 },
    { key: "verified", label: "Verified", icon: ShieldCheck },
];

function normalizeStatus(status: string): string {
    const map: Record<string, string> = {
        Submitted: "submitted",
        "In Progress": "in_progress",
        Resolved: "resolved",
        Closed: "resolved",
        Escalated: "escalated",
        Assigned: "assigned",
        Verified: "verified",
    };
    return map[status] || status.toLowerCase();
}

function getTimelineIndex(status: string) {
    const idx = timelineSteps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
}

function getPriorityInfo(score: number) {
    if (score > 70)
        return {
            label: "High",
            color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        };
    if (score > 40)
        return {
            label: "Medium",
            color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        };
    return {
        label: "Low",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
}

export default function ComplaintDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchComplaint() {
            try {
                const res = await api.get(`/complaints/${params.id}`);
                setComplaint(res.data?.data?.complaint);

                // Fetch timeline
                try {
                    const timelineRes = await api.get(`/complaints/${params.id}/timeline`);
                    setTimeline(timelineRes.data?.data?.timeline || []);
                } catch (e) {
                    console.error("Failed to fetch timeline", e);
                }
            } catch (err: any) {
                setError(
                    err?.response?.data?.message || "Failed to load complaint details."
                );
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchComplaint();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="size-10 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading complaint details…</p>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <AlertTriangle className="size-12 text-rose-500 mx-auto" />
                    <h2 className="text-xl font-bold">Complaint Not Found</h2>
                    <p className="text-muted-foreground">{error || "This complaint doesn't exist."}</p>
                    <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-full">
                        <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const normalized = normalizeStatus(complaint.status);
    const currentIdx = getTimelineIndex(normalized);
    const priority = getPriorityInfo(complaint.priority_score || 50);

    return (
        <div className="min-h-screen">
            <div className="pt-24 pb-12 px-4 sm:px-6">
                <Container className="max-w-4xl">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard")}
                            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
                        </Button>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        {complaint.fraud_flags && complaint.fraud_flags.length > 0 && (
                            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                <h3 className="text-rose-500 font-bold flex items-center gap-2 mb-2">
                                    <AlertTriangle className="size-5" />
                                    Suspicious Activity Detected
                                </h3>
                                <ul className="list-disc list-inside text-sm text-rose-400 space-y-1">
                                    {complaint.fraud_flags.map((flag: any, i: number) => (
                                        <li key={i}>
                                            <span className="font-semibold">{flag.type}:</span> {flag.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)]">
                                    {complaint.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3.5" />
                                        {new Date(complaint.created_at).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{timeAgo(complaint.created_at)}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="font-mono text-xs">#{complaint.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                    variant="outline"
                                    className={cn("text-xs px-3 py-1 rounded-full border", priority.color)}
                                >
                                    {priority.label} Priority
                                </Badge>
                                <StatusBadge status={normalized} />
                                {complaint.sla_deadline && normalized !== "resolved" && normalized !== "closed" && (
                                    <SlaTimer deadline={complaint.sla_deadline} />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Status Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass-card mb-6">
                            <CardContent className="pt-6 pb-6">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
                                    Status Timeline
                                </h3>
                                <div className="flex items-center gap-1">
                                    {timelineSteps.map((step, i) => {
                                        const StepIcon = step.icon;
                                        const isCompleted = i <= currentIdx;
                                        const isActive = i === currentIdx;
                                        return (
                                            <div key={step.key} className="flex items-center gap-2 flex-1">
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-center size-9 sm:size-10 rounded-full transition-all shrink-0",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                            : isCompleted
                                                                ? "bg-primary/20 text-primary"
                                                                : "bg-muted/50 text-muted-foreground/30"
                                                    )}
                                                >
                                                    <StepIcon className="size-4 sm:size-5" />
                                                </div>
                                                <span
                                                    className={cn(
                                                        "text-[10px] sm:text-xs font-medium whitespace-nowrap hidden md:block",
                                                        isActive
                                                            ? "text-primary"
                                                            : isCompleted
                                                                ? "text-muted-foreground"
                                                                : "text-muted-foreground/30"
                                                    )}
                                                >
                                                    {step.label}
                                                </span>
                                                {i < timelineSteps.length - 1 && (
                                                    <div
                                                        className={cn(
                                                            "flex-1 h-0.5 rounded-full mx-1",
                                                            isCompleted && i < currentIdx
                                                                ? "bg-primary/40"
                                                                : "bg-muted/30"
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Description */}
                            <Card className="glass-card">
                                <CardContent className="pt-6">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                        Description
                                    </h3>
                                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {complaint.description || "No description provided."}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Photo Evidence */}
                            {complaint.photo_url && (
                                <Card className="glass-card overflow-hidden">
                                    <CardContent className="pt-6">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                            Photo Evidence
                                        </h3>
                                        <div className="rounded-xl overflow-hidden border border-border/20">
                                            <img
                                                src={complaint.photo_url}
                                                alt="Complaint photo"
                                                className="w-full h-auto max-h-96 object-contain bg-muted/10"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {/* Resolution Proof - Before/After */}
                            {(normalized === 'resolved' || normalized === 'closed') && complaint.resolution_photo_url && (
                                <Card className="glass-card overflow-hidden border-emerald-500/30">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <ShieldCheck className="size-5 text-emerald-500" />
                                            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                                Verified Resolution
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Before</span>
                                                <div className="rounded-xl overflow-hidden border border-border/20">
                                                    <img
                                                        src={complaint.photo_url || '/placeholder.jpg'}
                                                        alt="Before"
                                                        className="w-full h-48 object-cover grayscale-[30%]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold text-emerald-500 uppercase">After</span>
                                                <div className="rounded-xl overflow-hidden border-2 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                                    <img
                                                        src={complaint.resolution_photo_url}
                                                        alt="After"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Details */}
                            <Card className="glass-card">
                                <CardContent className="pt-6 space-y-5">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Tag className="size-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Category</p>
                                                <p className="text-sm font-medium">{complaint.category || "General"}</p>
                                            </div>
                                        </div>

                                        {complaint.department && (
                                            <div className="flex items-start gap-3">
                                                <Building2 className="size-4 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Department</p>
                                                    <p className="text-sm font-medium">{complaint.department}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-3">
                                            <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Location</p>
                                                <p className="text-sm font-medium break-words">
                                                    {complaint.address || "Unknown location"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="size-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Priority Score</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-2 w-20 bg-muted/30 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                (complaint.priority_score || 0) > 70
                                                                    ? "bg-rose-500"
                                                                    : (complaint.priority_score || 0) > 40
                                                                        ? "bg-amber-500"
                                                                        : "bg-emerald-500"
                                                            )}
                                                            style={{
                                                                width: `${complaint.priority_score || 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium tabular-nums">
                                                        {complaint.priority_score || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <ThumbsUp className="size-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Upvotes</p>
                                                <p className="text-sm font-medium">{complaint.upvotes || 0}</p>
                                            </div>
                                        </div>

                                        {complaint.sla_hours && (
                                            <div className="flex items-start gap-3">
                                                <Clock className="size-4 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">SLA</p>
                                                    <p className="text-sm font-medium">{complaint.sla_hours} hours</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reporter Info */}
                            <Card className="glass-card">
                                <CardContent className="pt-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Reported By
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                                            {complaint.reporter_name
                                                ?.substring(0, 2)
                                                .toUpperCase() || "??"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {complaint.reporter_name || "Anonymous"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {complaint.reporter_email || ""}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Activity Log (Timeline) */}
                            <Card className="glass-card mb-4">
                                <CardContent className="pt-6 space-y-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="size-4" /> Activity Log
                                    </h3>
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                                        {timeline.map((event: any, i: number) => (
                                            <div key={i} className="relative flex items-start gap-4 pl-4">
                                                <div className="absolute left-0 mt-1.5 size-3.5 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                                                    <div className="size-1.5 rounded-full bg-primary" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-medium">{event.action}</p>
                                                    <p className="text-[10px] text-muted-foreground">{event.details}</p>
                                                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                                                        {new Date(event.created_at).toLocaleString('en-IN', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {timeline.length === 0 && (
                                            <p className="text-xs text-muted-foreground pl-4">No activity recorded yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timestamps */}
                            <Card className="glass-card">
                                <CardContent className="pt-6 space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        Activity
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created</span>
                                            <span className="font-medium">
                                                {new Date(complaint.created_at).toLocaleString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Updated</span>
                                            <span className="font-medium">
                                                {new Date(complaint.updated_at).toLocaleString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </Container>
            </div>
            <Footer />
        </div>
    );
}
