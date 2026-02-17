// app/leaderboard/page.tsx — Gamification leaderboard
// Follows: All SKILL.MD files
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Medal,
    Star,
    Award,
    Crown,
    TrendingUp,
    FileText,
    Flame,
    Loader2,
    ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/grid";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface LeaderboardUser {
    id: string;
    name: string;
    points: number;
    reports: number;
    badge: string;
    avatar?: string;
}

function getBadgeIcon(badge: string) {
    switch (badge) {
        case "Civic Hero":
            return <Crown className="size-3.5" aria-hidden="true" />;
        case "Neighborhood Guardian":
            return <ShieldCheck className="size-3.5" aria-hidden="true" />;
        case "Verified Reporter":
            return <Award className="size-3.5" aria-hidden="true" />;
        default:
            return <Star className="size-3.5" aria-hidden="true" />;
    }
}

function getBadgeVariant(badge: string) {
    switch (badge) {
        case "Civic Hero":
            return "default" as const;
        case "Neighborhood Guardian":
            return "info" as const;
        case "Verified Reporter":
            return "success" as const;
        default:
            return "secondary" as const;
    }
}

const podiumConfig = [
    { rank: 1, icon: Trophy, color: "from-amber-400 to-yellow-500", size: "size-20 sm:size-24", order: "order-2" },
    { rank: 2, icon: Medal, color: "from-slate-300 to-slate-400", size: "size-16 sm:size-20", order: "order-1" },
    { rank: 3, icon: Medal, color: "from-amber-600 to-amber-700", size: "size-16 sm:size-20", order: "order-3" },
];

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/users/leaderboard")
            .then((res) => {
                const raw = res.data?.data || res.data;
                if (Array.isArray(raw) && raw.length > 0) {
                    setUsers(
                        raw.map((u: any) => ({
                            id: String(u.id),
                            name: u.name || "Anonymous",
                            points: u.points || 0,
                            reports: u.reports || 0,
                            badge: u.badge || "Rising Star",
                        }))
                    );
                }
            })
            .catch(() => { /* No leaderboard data */ })
            .finally(() => setLoading(false));
    }, []);

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <section className="py-8 sm:py-12" aria-labelledby="leaderboard-heading">
            <Container>
                {/* Header */}
                <div className="text-center mb-10 sm:mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1
                            id="leaderboard-heading"
                            className="text-2xl sm:text-4xl font-bold mb-3"
                        >
                            Leaderboard
                        </h1>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Top civic contributors making their cities better.
                        </p>
                    </motion.div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-16">
                        <Loader2 className="size-8 mx-auto mb-4 animate-spin text-primary" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <Trophy className="size-12 mx-auto mb-4 opacity-30" aria-hidden="true" />
                        <p className="text-lg font-medium">No rankings yet</p>
                        <p className="text-sm mt-1">Be the first to report an issue and earn points!</p>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <>
                        {/* Podium */}
                        <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 sm:mb-16 max-w-2xl mx-auto">
                            {podiumConfig.map((config, i) => {
                                const user = top3[config.rank - 1];
                                if (!user) return null;
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: i * 0.15 }}
                                        className={cn("flex-1 text-center", config.order)}
                                    >
                                        <div className="relative inline-block mb-3">
                                            <Avatar
                                                className={cn(
                                                    config.rank === 1 ? "size-16" : "size-12",
                                                    "ring-2 ring-offset-2 ring-offset-background",
                                                    config.rank === 1
                                                        ? "ring-amber-400"
                                                        : config.rank === 2
                                                            ? "ring-slate-400"
                                                            : "ring-amber-600"
                                                )}
                                            >
                                                <AvatarFallback className={config.rank === 1 ? "text-xl font-bold" : "text-lg font-bold"}>
                                                    {user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={cn(
                                                    "absolute -top-2 -right-2 flex items-center justify-center size-7 rounded-full bg-gradient-to-br text-white text-xs font-bold",
                                                    config.color
                                                )}
                                            >
                                                <Icon className="size-3.5" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm sm:text-base font-semibold truncate">
                                            {user.name}
                                        </h3>
                                        <div className="text-lg sm:text-xl font-bold gradient-text tabular-nums">
                                            {user.points.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {user.reports} reports
                                        </div>
                                        <Badge
                                            variant={getBadgeVariant(user.badge)}
                                            className="mt-2 text-xs"
                                        >
                                            {getBadgeIcon(user.badge)}
                                            <span className="ml-1">{user.badge}</span>
                                        </Badge>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Rankings table */}
                        {rest.length > 0 && (
                            <Card className="glass-card overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="size-5 text-primary" aria-hidden="true" />
                                        Rankings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm" role="table">
                                            <thead>
                                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">
                                                        Rank
                                                    </th>
                                                    <th scope="col" className="px-4 sm:px-6 py-3 font-medium">
                                                        Citizen
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 sm:px-6 py-3 font-medium text-right"
                                                    >
                                                        Points
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 sm:px-6 py-3 font-medium text-right hidden sm:table-cell"
                                                    >
                                                        Reports
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-4 sm:px-6 py-3 font-medium text-right hidden md:table-cell"
                                                    >
                                                        Badge
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rest.map((user, i) => (
                                                    <motion.tr
                                                        key={user.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                                        className="border-b border-border/50 last:border-0 transition-colors duration-200 hover:bg-muted/30"
                                                    >
                                                        <td className="px-4 sm:px-6 py-3 tabular-nums font-medium text-muted-foreground">
                                                            #{i + 4}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="size-8">
                                                                    <AvatarFallback className="text-xs">{user.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-medium truncate">
                                                                    {user.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3 text-right tabular-nums font-semibold">
                                                            {user.points.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3 text-right tabular-nums hidden sm:table-cell">
                                                            {user.reports}
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-3 text-right hidden md:table-cell">
                                                            <Badge variant={getBadgeVariant(user.badge)} className="text-xs">
                                                                {getBadgeIcon(user.badge)}
                                                                <span className="ml-1">{user.badge}</span>
                                                            </Badge>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </Container>
        </section>
    );
}
