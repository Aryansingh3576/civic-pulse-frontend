"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    MapPin, Loader2, Filter, AlertTriangle, CheckCircle2, Clock, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import api from "@/lib/api";
import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("@/components/admin-map"), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] rounded-xl bg-muted/10 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
        </div>
    ),
});

export default function AdminMapPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        async function fetchComplaints() {
            try {
                const token = localStorage.getItem("admin_token");
                const res = await api.get("/complaints", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setComplaints(res.data?.data?.complaints || []);
            } catch (e) {
                console.error("Failed to fetch complaints", e);
            } finally {
                setLoading(false);
            }
        }
        fetchComplaints();
    }, []);

    // Apply filters
    const filtered = complaints.filter((c) => {
        if (statusFilter !== "all" && c.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
        if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
        return true;
    });

    const withLocation = filtered.filter((c) => c.latitude && c.longitude);

    // Stats
    const totalWithLoc = complaints.filter(c => c.latitude && c.longitude).length;
    const pendingCount = filtered.filter(c => c.status === "Submitted" || c.status === "submitted").length;
    const resolvedCount = filtered.filter(c => c.status === "Resolved" || c.status === "resolved").length;
    const criticalCount = filtered.filter(c => (c.priority_score || 0) > 70).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
                    Complaint <span className="gradient-text">Map</span>
                </h1>
                <p className="text-muted-foreground mt-1">
                    Visualize all reported issues across the city. Click markers for details.
                </p>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat icon={MapPin} label="On Map" value={totalWithLoc} color="text-primary" />
                <MiniStat icon={Clock} label="Pending" value={pendingCount} color="text-amber-500" />
                <MiniStat icon={CheckCircle2} label="Resolved" value={resolvedCount} color="text-emerald-500" />
                <MiniStat icon={AlertTriangle} label="Critical" value={criticalCount} color="text-rose-500" />
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-3 items-center"
            >
                <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] bg-card/50 border-border/30">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] bg-card/50 border-border/30">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="garbage">Garbage</SelectItem>
                        <SelectItem value="water">Water</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="road">Road</SelectItem>
                        <SelectItem value="streetlights">Streetlights</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="drainage">Drainage</SelectItem>
                        <SelectItem value="stray-animals">Stray Animals</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Badge variant="outline" className="text-xs ml-auto">
                    {withLocation.length} complaints on map
                </Badge>
            </motion.div>

            {/* Map */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="glass-card border-border/20 overflow-hidden">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="h-[550px] flex items-center justify-center">
                                <Loader2 className="size-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <AdminMap complaints={withLocation} />
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Legend */}
            <Card className="glass-card border-border/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="size-4 text-primary" /> Map Legend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: "Submitted", color: "#f59e0b" },
                            { label: "In Progress", color: "#3b82f6" },
                            { label: "Resolved", color: "#10b981" },
                            { label: "Rejected", color: "#ef4444" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div
                                    className="size-3 rounded-sm"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-muted-foreground">{item.label}</span>
                            </div>
                        ))}
                        <div className="border-l border-border/30 pl-4 ml-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Larger markers = higher priority</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    return (
        <div className="glass-card p-3 flex items-center gap-3">
            <Icon className={`size-5 ${color}`} />
            <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
