// app/dashboard/page.tsx — Premium Complaint Tracking Dashboard
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    BarChart3,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    ChevronRight,
    MapPin,
    TrendingUp,
    Loader2,
    Plus,
    Filter,
    UserCheck,
    ShieldCheck,
    Send,
    Search,
    Shield,
    LogIn,
} from "lucide-react";
import { Container } from "@/components/ui/grid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";
import Footer from "@/components/footer";
import { useAuth } from "@/providers/AuthProvider";

interface Complaint {
    id: string;
    title: string;
    status: string;
    category: string;
    address: string;
    priority_score: number;
    submitted_at: string;
}

function normalizeStatus(status: string): string {
    const map: Record<string, string> = {
        "Submitted": "submitted",
        "In Progress": "in_progress",
        "Resolved": "resolved",
        "Closed": "resolved",
        "Escalated": "escalated",
        "Assigned": "assigned",
        "Verified": "verified",
    };
    return map[status] || status.toLowerCase();
}

const statusFilters = [
    { id: "all", label: "All" },
    { id: "submitted", label: "Submitted" },
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
];

const categoryFilters = [
    "All Categories", "Garbage / Waste", "Water Supply", "Electricity",
    "Road Damage", "Street Lights", "Public Safety", "Drainage / Sewer"
];

const priorityFilters = [
    { id: "all", label: "All Priority" },
    { id: "high", label: "High" },
    { id: "medium", label: "Medium" },
    { id: "low", label: "Low" },
];

const timelineSteps = [
    { key: "submitted", label: "Submitted", icon: Send },
    { key: "assigned", label: "Assigned", icon: UserCheck },
    { key: "in_progress", label: "In Progress", icon: Clock },
    { key: "resolved", label: "Resolved", icon: CheckCircle2 },
    { key: "verified", label: "Verified", icon: ShieldCheck },
];

function getTimelineIndex(status: string) {
    const idx = timelineSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

function getPriorityLabel(score: number) {
    if (score > 70) return { label: "High", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" };
    if (score > 40) return { label: "Medium", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
    return { label: "Low", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
}

export default function DashboardPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) return; // skip fetch
        api.get("/complaints")
            .then((res) => {
                const raw = res.data?.data?.complaints || res.data;
                if (Array.isArray(raw)) {
                    setComplaints(raw.map((c: any) => ({
                        id: String(c.id),
                        title: c.title || "Untitled Report",
                        status: normalizeStatus(c.status || "submitted"),
                        category: c.category || "General",
                        address: c.address || "Unknown location",
                        priority_score: c.priority_score || c.priority || 50,
                        submitted_at: c.created_at || c.submitted_at || new Date().toISOString(),
                    })));
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = complaints.filter((c) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (categoryFilter !== "All Categories" && c.category !== categoryFilter) return false;
        if (priorityFilter === "high" && c.priority_score <= 70) return false;
        if (priorityFilter === "medium" && (c.priority_score <= 40 || c.priority_score > 70)) return false;
        if (priorityFilter === "low" && c.priority_score > 40) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const stats = [
        { label: "Total Reports", value: complaints.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Resolved", value: complaints.filter(c => c.status === "resolved" || c.status === "verified").length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Pending", value: complaints.filter(c => c.status === "submitted").length, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "High Priority", value: complaints.filter(c => c.priority_score > 70).length, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10" },
    ];

    // Auth loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Auth gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="glass-card max-w-md w-full p-10 text-center border-primary/20">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-5">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Please sign in to track your complaint submissions and monitor their progress.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild className="rounded-full px-6">
                            <Link href="/login"><LogIn className="mr-2 size-4" /> Sign In</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full px-6">
                            <Link href="/register">Create Account</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="pt-24 pb-12 px-4 sm:px-6">
                <Container className="max-w-6xl">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2"
                            >
                                Complaint <span className="gradient-text">Tracker</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-muted-foreground"
                            >
                                Monitor and track civic issues across your community in real-time.
                            </motion.p>
                        </div>

                        <Link href="/report">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                            >
                                <Plus className="size-5" />
                                New Report
                            </motion.button>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-5"
                            >
                                <div className={cn("inline-flex p-2.5 rounded-xl mb-3", stat.bg, stat.color)}>
                                    <stat.icon className="size-5" />
                                </div>
                                <div className="text-2xl font-bold tabular-nums mb-0.5">{stat.value}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-6">
                        {/* Search */}
                        <div className="relative w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                placeholder="Search issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-card/50 border border-border/30 rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            {statusFilters.map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                        statusFilter === f.id
                                            ? "bg-primary/10 text-primary border border-primary/20"
                                            : "text-muted-foreground hover:bg-muted border border-transparent"
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-card/50 border border-border/30 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                        >
                            {categoryFilters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="bg-card/50 border border-border/30 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                        >
                            {priorityFilters.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                        </select>
                    </div>

                    {/* Complaint List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="size-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Syncing data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 px-6 glass-card border-dashed border-2 border-border/20">
                            <FileText className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-1">No reports found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or submit a new report.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((complaint, i) => (
                                <ComplaintCard key={complaint.id} complaint={complaint} index={i} />
                            ))}
                        </div>
                    )}

                    {/* Map Section Placeholder */}
                    <div className="mt-12 glass-card p-8 text-center">
                        <MapPin className="size-10 text-primary/30 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-1">Issue Map & Red Zones</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            Interactive map showing issue pins and high-issue red zones.
                        </p>
                        <Link href="/map">
                            <button className="mt-4 px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                                Open Full Map →
                            </button>
                        </Link>
                    </div>
                </Container>
            </div>

            <Footer />
        </div>
    );
}

function ComplaintCard({ complaint, index }: { complaint: Complaint; index: number }) {
    const currentIdx = getTimelineIndex(complaint.status);
    const priority = getPriorityLabel(complaint.priority_score);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/dashboard/${complaint.id}`}>
                <div className="group glass-card p-5 hover:bg-card/30 transition-colors cursor-pointer space-y-4">
                    {/* Top Row: Info + Badges */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex gap-4 items-start">
                            <div className={cn(
                                "flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br border border-border/20 shrink-0",
                                complaint.priority_score > 70 ? "from-rose-500/20 to-rose-900/10 text-rose-400" : "from-primary/15 to-primary/5 text-primary"
                            )}>
                                <TrendingUp className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-medium group-hover:text-primary transition-colors mb-1">
                                    {complaint.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="size-3" />
                                        {complaint.address}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{complaint.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>{new Date(complaint.submitted_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-15 sm:pl-0">
                            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-full border", priority.color)}>
                                {priority.label}
                            </Badge>
                            <StatusBadge status={complaint.status} />
                            <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                        </div>
                    </div>

                    {/* Timeline Stepper */}
                    <div className="flex items-center gap-1 px-2">
                        {timelineSteps.map((step, i) => {
                            const StepIcon = step.icon;
                            const isCompleted = i <= currentIdx;
                            const isActive = i === currentIdx;
                            return (
                                <div key={step.key} className="flex items-center gap-1 flex-1">
                                    <div className={cn(
                                        "flex items-center justify-center size-6 rounded-full transition-all shrink-0",
                                        isActive ? "bg-primary text-primary-foreground" :
                                            isCompleted ? "bg-primary/20 text-primary" :
                                                "bg-muted/50 text-muted-foreground/30"
                                    )}>
                                        <StepIcon className="size-3" />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-medium whitespace-nowrap hidden lg:block",
                                        isActive ? "text-primary" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/30"
                                    )}>
                                        {step.label}
                                    </span>
                                    {i < timelineSteps.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 rounded-full mx-1",
                                            isCompleted && i < currentIdx ? "bg-primary/30" : "bg-muted/30"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
