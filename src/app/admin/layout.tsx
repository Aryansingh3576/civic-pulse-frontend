"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, AlertTriangle, LogOut, Shield, Menu, X, Loader2,
    FileText, Map, Search, Bell, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

const sidebarLinks = [
    { href: "/admin/dashboard", label: "Operations Center", icon: LayoutDashboard },
    { href: "/admin/complaints", label: "Complaint Registry", icon: AlertTriangle },
    { href: "/admin/reports", label: "Executive Reports", icon: FileText },
    { href: "/admin/map", label: "Geo Operations", icon: Map },
];

/* ═══ Rajasthan Jaipur Palette (Light) ═══
   Header:      #8B1A1A (Jaipur Maroon)
   Sidebar:     #FAF5F0 (Warm Cream)
   Background:  #F5EDE4 (Desert Sand)
   Panels:      #FFFFFF
   Accent:      #C0392B (Terracotta)
   Gold:        #B8860B (Rajasthani Gold)
   Borders:     #E8DDD4
   Text:        #3D2B1F (Warm Dark)
*/

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [liveTime, setLiveTime] = useState(new Date());
    const [criticalCount, setCriticalCount] = useState(0);
    const [systemStatus, setSystemStatus] = useState<"operational" | "alert">("operational");

    const isLoginPage = pathname === "/admin/login";

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch critical count
    useEffect(() => {
        if (isLoginPage) return;
        (async () => {
            try {
                const res = await api.get("/complaints");
                const all = res.data?.data?.complaints || [];
                const crits = all.filter((c: any) => (c.priority_score || 0) > 80 && !["Resolved", "resolved", "Closed"].includes(c.status));
                setCriticalCount(crits.length);
                setSystemStatus(crits.length > 0 ? "alert" : "operational");
            } catch { }
        })();
    }, [isLoginPage, pathname]);

    useEffect(() => {
        if (isLoginPage) { setIsChecking(false); return; }
        const token = localStorage.getItem("admin_token");
        const userStr = localStorage.getItem("admin_user");
        if (!token || !userStr) { router.replace("/admin/login"); return; }
        try {
            const user = JSON.parse(userStr);
            if (user.role !== "admin") { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user"); router.replace("/admin/login"); return; }
            setAdminUser(user);
        } catch { router.replace("/admin/login"); return; }
        setIsChecking(false);
    }, [isLoginPage, router, pathname]);

    function handleLogout() {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
    }

    if (isLoginPage) return <>{children}</>;

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5EDE4" }}>
                <div className="text-center space-y-3">
                    <Loader2 className="size-8 animate-spin mx-auto" style={{ color: "#C0392B" }} />
                    <p className="text-sm font-medium tracking-wider uppercase" style={{ color: "#8B6914" }}>Authenticating Credentials...</p>
                </div>
            </div>
        );
    }

    const timeStr = liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const dateStr = liveTime.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#F5EDE4", color: "#3D2B1F" }}>

            {/* ═══════════════ COMMAND HEADER — Jaipur Maroon ═══════════════ */}
            <header className="h-14 flex items-center justify-between px-4 lg:px-6 shadow-md shrink-0 relative z-30" style={{ background: "linear-gradient(135deg, #8B1A1A 0%, #A0282D 50%, #7A1518 100%)" }}>
                {/* Left: Emblem + Title */}
                <div className="flex items-center gap-3">
                    <button className="lg:hidden mr-1 p-1.5 rounded hover:bg-white/10" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                        {isMobileOpen ? <X className="size-5 text-white/80" /> : <Menu className="size-5 text-white/80" />}
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-sm flex items-center justify-center border border-white/20" style={{ background: "rgba(255,255,255,0.12)" }}>
                            <Shield className="size-5 text-amber-300" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold tracking-wide text-white leading-none">
                                RAJASTHAN CIVIC OPERATIONS CENTER
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={cn(
                                    "size-1.5 rounded-full",
                                    systemStatus === "operational" ? "bg-emerald-400 animate-pulse" : "bg-red-300 animate-pulse"
                                )} />
                                <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
                                    {systemStatus === "operational" ? "Systems Operational" : "Critical Alerts Active"} — Jaipur Division
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center: Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search complaints, districts, officers..."
                            className="w-full h-8 pl-8 pr-3 text-xs rounded-sm border outline-none placeholder-white/40 text-white"
                            style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.15)" }}
                        />
                    </div>
                </div>

                {/* Right: Clock + Alerts + Role */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-xs font-mono font-bold text-white tabular-nums tracking-wider">{timeStr}</span>
                        <span className="text-[10px] font-mono text-white/50 uppercase">{dateStr}</span>
                    </div>

                    <div className="w-px h-6 bg-white/15 hidden lg:block" />

                    {/* Emergency Alerts */}
                    <button className="relative p-1.5 rounded-sm hover:bg-white/10 transition-colors">
                        <Bell className="size-4 text-white/70" />
                        {criticalCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-sm text-[9px] font-bold text-white bg-amber-500 animate-pulse">
                                {criticalCount}
                            </span>
                        )}
                    </button>

                    <div className="w-px h-6 bg-white/15" />

                    {/* Role Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-sm border text-[10px] font-medium uppercase tracking-wider text-amber-200 border-white/15" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="size-1.5 rounded-full bg-amber-400" />
                        State Admin
                    </div>
                </div>
            </header>

            {/* ═══════════════ BODY ═══════════════ */}
            <div className="flex flex-1 min-h-0">
                {/* Sidebar — Warm Cream */}
                <aside className={cn(
                    "fixed inset-y-14 left-0 z-50 w-56 border-r transition-transform duration-200 lg:static lg:translate-x-0 shadow-sm",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )} style={{ background: "#FAF5F0", borderColor: "#E8DDD4" }}>
                    <div className="h-full flex flex-col py-3">
                        <nav className="flex-1 px-2 space-y-0.5">
                            {sidebarLinks.map((link) => {
                                const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold tracking-wide transition-all rounded-sm",
                                            isActive
                                                ? "border-l-[3px]"
                                                : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                                        )}
                                        style={isActive ? { background: "rgba(139,26,26,0.06)", color: "#8B1A1A", borderColor: "#8B1A1A" } : {}}
                                    >
                                        <link.icon className="size-4" />
                                        <span className="uppercase">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Rajasthan Branding */}
                        <div className="px-3 py-2 mx-2 mb-2 rounded-sm" style={{ background: "rgba(184,134,11,0.06)", border: "1px solid rgba(184,134,11,0.15)" }}>
                            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#B8860B" }}>Government of Rajasthan</p>
                            <p className="text-[9px] text-stone-400 mt-0.5">Civic Grievance Redressal</p>
                        </div>

                        {/* User Info */}
                        <div className="px-3 pt-2 border-t" style={{ borderColor: "#E8DDD4" }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-7 rounded-sm flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#8B1A1A" }}>
                                    {adminUser?.name?.substring(0, 2).toUpperCase() || "AD"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-stone-700 truncate">{adminUser?.name || "Admin"}</p>
                                    <p className="text-[10px] text-stone-400 truncate">{adminUser?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors uppercase tracking-wider"
                            >
                                <LogOut className="size-3.5" /> Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-3 lg:p-5 relative" style={{ background: "#F5EDE4" }}>
                    {/* Hawa Mahal Full Background */}
                    <div
                        className="fixed inset-0 pointer-events-none z-0"
                        style={{
                            backgroundImage: "url('/hawa-mahal-bg.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            opacity: 0.10,
                            filter: "sepia(20%) saturate(1.2)",
                        }}
                    />
                    <div className="max-w-[1600px] mx-auto relative z-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(61,43,31,0.4)" }} onClick={() => setIsMobileOpen(false)} />
            )}
        </div>
    );
}
