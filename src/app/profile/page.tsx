"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Shield, Trophy, Star, FileText, Award, Edit3, Save, X, Loader2, TrendingUp, Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    points: number;
    badge: string;
    total_reports: number;
    created_at: string;
}

function getBadgeIcon(badge: string) {
    switch (badge) {
        case "Champion": return "🏆";
        case "Guardian": return "🛡️";
        case "Civic Hero": return "⭐";
        default: return "🌟";
    }
}

function getLevel(points: number) {
    return Math.floor(points / 100) + 1;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/users/profile")
            .then((res) => {
                const u = res.data?.data?.user;
                if (u) {
                    setProfile(u);
                    setEditName(u.name);
                }
            })
            .catch(() => {
                // Demo profile
                setProfile({
                    id: 1,
                    name: "Demo User",
                    email: "demo@civicpulse.in",
                    role: "citizen",
                    points: 150,
                    badge: "Civic Hero",
                    total_reports: 8,
                    created_at: "2026-01-15T10:30:00",
                });
                setEditName("Demo User");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            await api.patch("/users/profile", { name: editName });
            setProfile((prev) => prev ? { ...prev, name: editName } : prev);
            setEditing(false);
        } catch {
            // Demo mode
            setProfile((prev) => prev ? { ...prev, name: editName } : prev);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="glass-card p-10 text-center max-w-md">
                    <User className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Login Required</h2>
                    <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
                    <a href="/login" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-full font-medium">
                        Login
                    </a>
                </div>
            </div>
        );
    }

    const level = getLevel(profile.points);
    const xpInLevel = profile.points % 100;

    const statsCards = [
        { label: "Total Reports", value: profile.total_reports, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Total Points", value: profile.points, icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Current Level", value: level, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Badge", value: profile.badge, icon: Award, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Profile Header */}
                    <div className="glass-card p-8 mb-6">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shrink-0">
                                {getBadgeIcon(profile.badge)}
                            </div>

                            <div className="flex-1 min-w-0">
                                {editing ? (
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="text-2xl font-bold bg-white/5 border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:border-primary/30 w-full"
                                        />
                                        <button onClick={handleSave} disabled={saving} className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20">
                                            <Save className="size-4" />
                                        </button>
                                        <button onClick={() => { setEditing(false); setEditName(profile.name); }} className="p-2 rounded-lg bg-rose-400/10 text-rose-400 hover:bg-rose-400/20">
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mb-2">
                                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                                        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5">
                                            <Edit3 className="size-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Mail className="size-3.5" /> {profile.email}</span>
                                    <span className="flex items-center gap-1"><Shield className="size-3.5" /> {profile.role}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3.5" />
                                        Joined {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Level Progress */}
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">Level {level}</span>
                                <span className="text-xs text-muted-foreground">{xpInLevel}/100 XP to next level</span>
                            </div>
                            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpInLevel}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {statsCards.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                className="glass-card p-5 text-center"
                            >
                                <div className={`inline-flex p-2 rounded-xl mb-2 ${s.bg} ${s.color}`}>
                                    <s.icon className="size-4" />
                                </div>
                                <div className="text-xl font-bold">{s.value}</div>
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Badges */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Star className="size-5 text-amber-400" /> Badge Progress
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { name: "Rising Star", pts: 0, emoji: "🌟" },
                                { name: "Civic Hero", pts: 500, emoji: "⭐" },
                                { name: "Guardian", pts: 1000, emoji: "🛡️" },
                                { name: "Champion", pts: 2500, emoji: "🏆" },
                            ].map((b) => {
                                const earned = profile.points >= b.pts;
                                return (
                                    <div key={b.name} className={`p-4 rounded-xl text-center transition-all ${earned ? "bg-amber-400/5 border border-amber-400/20" : "bg-white/[0.02] border border-white/5 opacity-40"}`}>
                                        <div className="text-3xl mb-2">{b.emoji}</div>
                                        <div className="text-sm font-medium">{b.name}</div>
                                        <div className="text-xs text-muted-foreground">{b.pts} pts</div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
