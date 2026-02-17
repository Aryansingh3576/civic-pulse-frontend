"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, X, CheckCircle, AlertTriangle, MapPin, MessageSquare,
    Clock, Trash2, Eye, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

interface Notification {
    id: string;
    type: "status_change" | "nearby_issue" | "resolution" | "upvote" | "system";
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

const ICONS: Record<string, any> = {
    status_change: CheckCircle,
    nearby_issue: MapPin,
    resolution: Eye,
    upvote: AlertTriangle,
    system: MessageSquare,
};

const ICON_COLORS: Record<string, string> = {
    status_change: "text-emerald-400 bg-emerald-500/10",
    nearby_issue: "text-blue-400 bg-blue-500/10",
    resolution: "text-purple-400 bg-purple-500/10",
    upvote: "text-amber-400 bg-amber-500/10",
    system: "text-primary bg-primary/10",
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationCenter() {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const unread = notifications.filter((n) => !n.read).length;

    // Fetch notifications from backend when dropdown opens
    useEffect(() => {
        if (!open || fetched) return;
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) { setFetched(true); return; }

        setLoading(true);
        fetch(`${API}/complaints/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                const raw = data?.data?.notifications || [];
                setNotifications(raw.map((n: any) => ({
                    id: String(n.id),
                    type: n.type || "system",
                    title: n.title,
                    message: n.message,
                    time: n.time,
                    read: n.read ?? false,
                    link: n.link,
                })));
            })
            .catch(() => setNotifications([]))
            .finally(() => { setLoading(false); setFetched(true); });
    }, [open, fetched, API]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    const clearAll = () => setNotifications([]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
                aria-label={t("notifications")}
            >
                <Bell className="size-5" />
                {unread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background"
                    >
                        {unread}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-[380px] max-h-[500px] rounded-2xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden z-[200]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                            <h3 className="font-semibold text-sm">{t("notifications")}</h3>
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                                        {t("mark_all_read")}
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                                    <X className="size-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto max-h-[380px] scrollbar-hide">
                            {loading ? (
                                <div className="py-12 flex items-center justify-center">
                                    <Loader2 className="size-6 animate-spin text-primary" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    <Bell className="size-8 mx-auto mb-2 opacity-30" />
                                    {t("no_notifications")}
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const Icon = ICONS[n.type] || Bell;
                                    const content = (
                                        <div
                                            key={n.id}
                                            onClick={() => markRead(n.id)}
                                            className={cn(
                                                "flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-border/10",
                                                !n.read && "bg-primary/[0.03]"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-xl shrink-0 h-fit", ICON_COLORS[n.type])}>
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
                                                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                                                    <Clock className="size-3" /> {timeAgo(n.time)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                    return n.link ? <Link key={n.id} href={n.link}>{content}</Link> : <div key={n.id}>{content}</div>;
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-between">
                                <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-rose-400 flex items-center gap-1 transition-colors">
                                    <Trash2 className="size-3" /> {t("clear_all")}
                                </button>
                                <span className="text-[10px] text-muted-foreground">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
