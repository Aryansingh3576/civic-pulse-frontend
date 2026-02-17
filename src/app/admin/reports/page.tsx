"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    FileText, Download, Printer, Calendar, BarChart3, PieChart, TrendingUp,
    MapPin, AlertTriangle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    api.get("/complaints/stats"),
                    api.get("/complaints/analytics?period=30")
                ]);
                setStats(statsRes.data?.data);
                setAnalytics(analyticsRes.data?.data);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString("en-IN", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="space-y-8">
            {/* Header - Hidden in Print */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Smart Reports</h1>
                    <p className="text-muted-foreground">Generate and download insights for administrative review.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 size-4" /> Print Report
                    </Button>
                    <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                        <Download className="mr-2 size-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Printable Report Content */}
            <div ref={printRef} className="print:p-0 space-y-8" id="printable-area">

                {/* Report Header (Print Only Style) */}
                <div className="hidden print:block border-b pb-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-black">Civic<span className="text-primary">Connect</span> Operations Report</h1>
                            <p className="text-sm text-gray-500">Generated on {currentDate}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold">Department of Civic Affairs</p>
                            <p>Official Record</p>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="print:border print:shadow-none bg-primary/5 border-primary/10">
                        <CardContent className="p-6">
                            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                <FileText className="size-4" /> Total Complaints
                            </div>
                            <div className="text-3xl font-bold">{stats?.total || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="print:border print:shadow-none bg-emerald-500/5 border-emerald-500/10">
                        <CardContent className="p-6">
                            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                <TrendingUp className="size-4 text-emerald-500" /> Resolution Rate
                            </div>
                            <div className="text-3xl font-bold text-emerald-600">
                                {stats?.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="print:border print:shadow-none bg-amber-500/5 border-amber-500/10">
                        <CardContent className="p-6">
                            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                <AlertTriangle className="size-4 text-amber-500" /> Open Issues
                            </div>
                            <div className="text-3xl font-bold text-amber-600">
                                {(stats?.submitted || 0) + (stats?.in_progress || 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="print:border print:shadow-none bg-rose-500/5 border-rose-500/10">
                        <CardContent className="p-6">
                            <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                <AlertTriangle className="size-4 text-rose-500" /> Escalated
                            </div>
                            <div className="text-3xl font-bold text-rose-600 font-mono">
                                {stats?.escalated || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
                    {/* Category Breakdown */}
                    <Card className="print:border print:shadow-none print:break-inside-avoid">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <PieChart className="size-5 text-primary" />
                                Complaint Categories
                            </h3>
                            <div className="space-y-4">
                                {analytics?.byCategory?.slice(0, 5).map((cat: any, i: number) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{cat.category}</span>
                                            <span className="text-muted-foreground">{cat.count} ({Math.round((cat.count / (stats?.total || 1)) * 100)}%)</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${(cat.count / (stats?.total || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Neglected Areas */}
                    <Card className="print:border print:shadow-none print:break-inside-avoid">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <MapPin className="size-5 text-rose-500" />
                                Critical Impact Areas
                            </h3>
                            <div className="space-y-4">
                                {analytics?.topAreas?.map((area: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 print:bg-transparent print:border-b">
                                        <span className="text-sm font-medium truncate max-w-[70%]">{area.address || "Unknown Location"}</span>
                                        <span className="text-sm font-bold bg-rose-500/10 text-rose-600 px-2 py-1 rounded inline-block">
                                            {area.count} Issues
                                        </span>
                                    </div>
                                ))}
                                {(!analytics?.topAreas || analytics.topAreas.length === 0) && (
                                    <p className="text-muted-foreground text-sm">No critical areas identified.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trends Table */}
                <Card className="print:border print:shadow-none print:break-inside-avoid">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calendar className="size-5 text-purple-500" />
                            Monthly Performance Trend
                        </h3>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 print:bg-transparent border-b">
                                    <tr>
                                        <th className="px-6 py-3">Month</th>
                                        <th className="px-6 py-3">Total Reports</th>
                                        <th className="px-6 py-3">Resolved</th>
                                        <th className="px-6 py-3">Resolution Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.monthlyTrends?.map((trend: any, i: number) => (
                                        <tr key={i} className="border-b hover:bg-muted/10">
                                            <td className="px-6 py-4 font-medium">{trend.month}</td>
                                            <td className="px-6 py-4">{trend.total}</td>
                                            <td className="px-6 py-4 text-emerald-600">{trend.resolved}</td>
                                            <td className="px-6 py-4">
                                                {Math.round((trend.resolved / trend.total) * 100)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Print Footer */}
                <div className="hidden print:block pt-8 border-t mt-8 text-center text-sm text-gray-400">
                    <p>CivicConnect Automated System Report • {currentDate}</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 2cm; }
                    body { background: white; color: black; }
                    .glass-card { background: white !important; border: 1px solid #ddd !important; box-shadow: none !important; }
                    .text-muted-foreground { color: #666 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}
