"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, MessageSquare, Loader2, Clock, MapPin, User as UserIcon,
    Search, TrendingUp, Sparkles, EyeOff, Share2, BookmarkPlus, AlertTriangle,
    ArrowUp, ChevronRight,
} from "lucide-react";
import Footer from "@/components/footer";
import { useLanguage } from "@/providers/LanguageProvider";

interface Post {
    id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    address: string;
    photo_url: string | null;
    upvotes: number;
    reporter_name: string;
    is_anonymous: boolean;
    created_at: string;
    voted?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    Submitted: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    "In Progress": { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
    Resolved: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    Closed: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
    Assigned: { bg: "bg-indigo-500/10", text: "text-indigo-600", dot: "bg-indigo-500" },
};

const CATEGORY_COLORS: Record<string, string> = {
    "Road Damage": "from-orange-500 to-amber-500",
    "Water Supply": "from-cyan-500 to-blue-500",
    "Electricity": "from-yellow-500 to-orange-500",
    "Garbage": "from-green-600 to-emerald-500",
    "Street Light": "from-amber-400 to-yellow-500",
    "Drainage": "from-blue-600 to-indigo-500",
    "default": "from-violet-500 to-purple-500",
};

export default function CommunityPage() {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [votingId, setVotingId] = useState<string | null>(null);
    const [doubleTapId, setDoubleTapId] = useState<string | null>(null);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    useEffect(() => {
        setLoading(true);
        fetch(`${API}/complaints/community?sort=${sort}`)
            .then((r) => r.json())
            .then((data) => {
                const raw = data?.data?.posts || [];
                setPosts(raw.map((p: any) => ({ ...p, voted: false })));
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [sort, API]);

    const handleVote = useCallback(async (id: string) => {
        setVotingId(id);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
            alert(t("login") + " required");
            setVotingId(null);
            return;
        }

        // Optimistic update
        setPosts((prev) =>
            prev.map((post) =>
                post.id === id
                    ? { ...post, upvotes: post.voted ? post.upvotes - 1 : post.upvotes + 1, voted: !post.voted }
                    : post
            )
        );

        try {
            const res = await fetch(`${API}/complaints/${id}/upvote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                // Revert on failure
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === id
                            ? { ...post, upvotes: post.voted ? post.upvotes - 1 : post.upvotes + 1, voted: !post.voted }
                            : post
                    )
                );
            }
        } catch {
            // Revert on error
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === id
                        ? { ...post, upvotes: post.voted ? post.upvotes - 1 : post.upvotes + 1, voted: !post.voted }
                        : post
                )
            );
        } finally {
            setVotingId(null);
        }
    }, [API, t]);

    const handleDoubleTap = useCallback((id: string) => {
        const post = posts.find(p => p.id === id);
        if (post && !post.voted) {
            handleVote(id);
        }
        setDoubleTapId(id);
        setTimeout(() => setDoubleTapId(null), 800);
    }, [posts, handleVote]);

    const filtered = posts.filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.title.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.address?.toLowerCase().includes(q)
        );
    });

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d`;
        const weeks = Math.floor(days / 7);
        return `${weeks}w`;
    }

    function getInitials(name: string) {
        return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }

    function getCategoryGradient(cat: string) {
        return CATEGORY_COLORS[cat] || CATEGORY_COLORS["default"];
    }

    return (
        <div className="min-h-screen bg-background">
            <section className="pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-1">
                            {t("community_feed").split(" ")[0]}{" "}
                            <span className="gradient-text">{t("community_feed").split(" ").slice(1).join(" ")}</span>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t("community_feed_subtitle")}
                        </p>
                    </motion.div>

                    {/* Search & Sort - Sticky */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="sticky top-20 z-20 bg-background/80 backdrop-blur-xl pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
                    >
                        <div className="relative mb-3">
                            <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={t("search_community")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-muted/40 border border-border/50 text-sm focus:outline-none focus:border-primary/40 focus:bg-background placeholder:text-muted-foreground/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSort("newest")}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${sort === "newest"
                                    ? "bg-foreground text-background shadow-lg"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/30"
                                    }`}
                            >
                                <Sparkles className="size-3.5" />
                                {t("newest")}
                            </button>
                            <button
                                onClick={() => setSort("most_voted")}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${sort === "most_voted"
                                    ? "bg-foreground text-background shadow-lg"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted border border-border/30"
                                    }`}
                            >
                                <TrendingUp className="size-3.5" />
                                {t("most_voted")}
                            </button>
                        </div>
                    </motion.div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="size-8 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Loading community posts…</p>
                        </div>
                    )}

                    {/* Instagram-Style Card Feed */}
                    {!loading && (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {filtered.map((post, i) => {
                                    const status = STATUS_CONFIG[post.status] || STATUS_CONFIG["Submitted"];
                                    const gradient = getCategoryGradient(post.category);
                                    return (
                                        <motion.article
                                            key={post.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: i * 0.05, duration: 0.4 }}
                                            className="bg-card rounded-3xl border border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            {/* Card Header - User Info */}
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                        {post.is_anonymous ? (
                                                            <EyeOff className="size-4" />
                                                        ) : (
                                                            getInitials(post.reporter_name || "?")
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold leading-tight">
                                                            {post.is_anonymous ? t("anonymous_citizen") : post.reporter_name}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            {post.address && (
                                                                <>
                                                                    <MapPin className="size-3" />
                                                                    <span className="truncate max-w-[180px]">{post.address}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${status.bg} ${status.text}`}>
                                                        <span className={`size-1.5 rounded-full ${status.dot}`} />
                                                        {post.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Image - Full Width, Prominent */}
                                            {post.photo_url ? (
                                                <div
                                                    className="relative w-full aspect-[4/3] bg-muted/20 cursor-pointer select-none overflow-hidden"
                                                    onDoubleClick={() => handleDoubleTap(post.id)}
                                                >
                                                    <img
                                                        src={post.photo_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    {/* Category badge overlay */}
                                                    <div className="absolute top-3 left-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white backdrop-blur-sm`}>
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                    {/* Double-tap heart animation */}
                                                    <AnimatePresence>
                                                        {doubleTapId === post.id && (
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1.2, opacity: 1 }}
                                                                exit={{ scale: 1.6, opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                            >
                                                                <Heart className="size-20 text-white fill-white drop-shadow-2xl" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ) : (
                                                /* No-image placeholder with gradient */
                                                <div className={`relative w-full aspect-[3/1] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                                                    <div className="text-center text-white/90 p-6">
                                                        <AlertTriangle className="size-8 mx-auto mb-2 opacity-80" />
                                                        <p className="text-sm font-medium">{post.category}</p>
                                                    </div>
                                                    {/* Double-tap heart animation */}
                                                    <AnimatePresence>
                                                        {doubleTapId === post.id && (
                                                            <motion.div
                                                                initial={{ scale: 0, opacity: 0 }}
                                                                animate={{ scale: 1.2, opacity: 1 }}
                                                                exit={{ scale: 1.6, opacity: 0 }}
                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                            >
                                                                <Heart className="size-20 text-white fill-white drop-shadow-2xl" />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}

                                            {/* Action Row */}
                                            <div className="px-4 pt-3 pb-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleVote(post.id)}
                                                            disabled={votingId === post.id}
                                                            className="group flex items-center gap-1 transition-all"
                                                        >
                                                            <motion.div
                                                                whileTap={{ scale: 1.3 }}
                                                                transition={{ type: "spring", stiffness: 500 }}
                                                            >
                                                                <Heart
                                                                    className={`size-6 transition-colors ${post.voted
                                                                        ? "text-rose-500 fill-rose-500"
                                                                        : "text-foreground hover:text-rose-400"
                                                                        }`}
                                                                />
                                                            </motion.div>
                                                        </button>
                                                        <button className="text-foreground hover:text-muted-foreground transition-colors">
                                                            <MessageSquare className="size-6" />
                                                        </button>
                                                        <button className="text-foreground hover:text-muted-foreground transition-colors">
                                                            <Share2 className="size-6" />
                                                        </button>
                                                    </div>
                                                    <button className="text-foreground hover:text-muted-foreground transition-colors">
                                                        <BookmarkPlus className="size-6" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Upvotes Count */}
                                            <div className="px-4 pb-1">
                                                <p className="text-sm font-bold">
                                                    {post.upvotes} {post.upvotes === 1 ? "upvote" : "upvotes"}
                                                </p>
                                            </div>

                                            {/* Title & Description */}
                                            <div className="px-4 pb-2">
                                                <p className="text-sm">
                                                    <span className="font-semibold mr-1.5">{post.is_anonymous ? t("anonymous_citizen") : post.reporter_name}</span>
                                                    <span className="font-medium text-foreground">{post.title}</span>
                                                </p>
                                                {post.description && (
                                                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                                        {post.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Timestamp */}
                                            <div className="px-4 pb-4">
                                                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">
                                                    {timeAgo(post.created_at)} ago
                                                </p>
                                            </div>
                                        </motion.article>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filtered.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24"
                        >
                            <div className="size-20 mx-auto mb-5 rounded-3xl bg-muted/50 flex items-center justify-center">
                                <MessageSquare className="size-10 text-muted-foreground/30" />
                            </div>
                            <p className="text-lg font-semibold mb-1">{t("no_community_posts")}</p>
                            <p className="text-sm text-muted-foreground mb-6">{t("be_first_share")}</p>
                            <Link href="/report">
                                <button className="px-8 py-3 bg-foreground text-background rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 mx-auto">
                                    {t("report_an_issue")}
                                    <ChevronRight className="size-4" />
                                </button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}
