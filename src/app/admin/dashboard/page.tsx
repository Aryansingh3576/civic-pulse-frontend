"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    MoreHorizontal,
    MapPin,
    ArrowUpCircle,
    Clock,
    Copy,
    Camera,
    Eye,
    Merge,
    Timer,
    FileCheck,
    Loader2,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        critical: 0
    });
    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDept, setSelectedDept] = useState("All");

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get("/complaints");
                const allData = res.data?.data?.complaints || [];

                // Filter by Department
                const data = selectedDept === "All"
                    ? allData
                    : allData.filter((c: any) => c.department === selectedDept);

                setStats({
                    total: data.length,
                    pending: data.filter((c: any) => c.status === "Submitted" || c.status === "submitted").length,
                    resolved: data.filter((c: any) => c.status === "Resolved" || c.status === "resolved").length,
                    critical: data.filter((c: any) => (c.priority_score || c.priority) > 80).length
                });

                setRecentReports(data.slice(0, 10));
            } catch (e) {
                console.error("Failed to fetch admin data", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedDept]);

    // Mock duplicate clusters for UI
    const duplicateClusters = [
        {
            id: "dup-1",
            title: "Road Damage — MG Road Area",
            count: 4,
            priority: 92,
            reports: ["#a3b1", "#c2d3", "#e4f5", "#g6h7"],
        },
        {
            id: "dup-2",
            title: "Water Leak — Sector 21",
            count: 3,
            priority: 78,
            reports: ["#j8k9", "#l0m1", "#n2o3"],
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
                        Admin <span className="gradient-text">Overview</span>
                    </h1>
                    <p className="text-muted-foreground">Manage tickets, escalations, and proof verification.</p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 min-w-[150px] justify-between">
                            {selectedDept} Department
                            <Filter className="size-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {["All", "Roads", "Waste", "Water", "Electricity", "Parks", "Traffic"].map(dept => (
                            <DropdownMenuItem key={dept} onClick={() => setSelectedDept(dept)}>
                                {dept}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Reports" value={stats.total} icon={TrendingUp} description="All-time submissions" />
                <StatCard title="Pending Review" value={stats.pending} icon={Clock} description="Requires attention" alert={stats.pending > 10} />
                <StatCard title="Issues Resolved" value={stats.resolved} icon={CheckCircle2} description="Successfully closed" />
                <StatCard title="Critical Issues" value={stats.critical} icon={AlertTriangle} description="High priority" critical />
            </div>

            {/* Ticket Queue Table */}
            <Card className="glass-card border-border/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck className="size-5 text-primary" />
                        Ticket Queue
                    </CardTitle>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                        {recentReports.length} tickets
                    </Badge>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/20">
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Escalation</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="size-5 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : recentReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No tickets in queue
                                    </TableCell>
                                </TableRow>
                            ) : recentReports.map((report: any) => {
                                const score = report.priority_score || 50;
                                const daysOld = Math.floor((Date.now() - new Date(report.created_at || Date.now()).getTime()) / 86400000);
                                const shouldEscalate = daysOld > 3 && report.status !== "Resolved" && report.status !== "resolved";
                                return (
                                    <TableRow key={report.id} className="hover:bg-card/30 border-border/10">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{String(report.id).substring(0, 8)}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate">{report.title}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={report.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-14 bg-muted/30 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", score > 70 ? "bg-rose-500" : score > 40 ? "bg-amber-500" : "bg-emerald-500")}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground tabular-nums">{score}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {shouldEscalate ? (
                                                <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] gap-1">
                                                    <ArrowUpCircle className="size-3" />
                                                    Escalate ({daysOld}d)
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/30 gap-1">
                                                    <Timer className="size-3" />
                                                    {daysOld}d
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-3" />
                                                {report.address || "Unknown"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-card">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/complaints/${report.id}`}>
                                                            <Eye className="mr-2 size-4" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <ArrowUpCircle className="mr-2 size-4" /> Escalate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <CheckCircle2 className="mr-2 size-4" /> Mark Resolved
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <AlertTriangle className="mr-2 size-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Two Column: Duplicates + Proof Verification */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Duplicate Issue Merge Tool */}
                <Card className="glass-card border-border/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Copy className="size-5 text-primary" />
                            Duplicate Detection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {duplicateClusters.map((cluster) => (
                            <div key={cluster.id} className="p-4 rounded-xl border border-border/20 bg-card/30 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-sm">{cluster.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {cluster.count} similar reports detected
                                        </p>
                                    </div>
                                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">
                                        Priority: {cluster.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {cluster.reports.map(r => (
                                        <span key={r} className="text-[10px] font-mono bg-muted/30 px-2 py-0.5 rounded-full text-muted-foreground">
                                            {r}
                                        </span>
                                    ))}
                                </div>
                                <Button size="sm" variant="outline" className="w-full rounded-lg text-xs gap-1.5">
                                    <Merge className="size-3.5" />
                                    Merge Duplicates
                                </Button>
                            </div>
                        ))}
                        {duplicateClusters.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-6">No duplicate clusters detected.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Proof Verification */}
                <Card className="glass-card border-border/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Camera className="size-5 text-primary" />
                            Proof Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Mock proof items */}
                        {[
                            { id: "pv-1", title: "Pothole on NH-48", type: "Resolution Photo", status: "pending" },
                            { id: "pv-2", title: "Broken Street Light #42", type: "Before/After", status: "verified" },
                            { id: "pv-3", title: "Garbage Dump — Block C", type: "Resolution Photo", status: "pending" },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-border/20 bg-card/30">
                                <div className="size-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                                    <Camera className="size-5 text-muted-foreground/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                    <p className="text-[11px] text-muted-foreground">{item.type}</p>
                                </div>
                                {item.status === "verified" ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] gap-1">
                                        <CheckCircle2 className="size-3" /> Verified
                                    </Badge>
                                ) : (
                                    <Button size="sm" variant="outline" className="text-xs rounded-lg gap-1">
                                        <Eye className="size-3.5" /> Review
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, description, alert, critical }: any) {
    return (
        <Card className="glass-card border-border/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", critical && "text-rose-500", alert && "text-amber-500")} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
