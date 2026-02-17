"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUp, MessageSquare, Loader2, Clock, MapPin, User as UserIcon,
    Search, TrendingUp, Sparkles, EyeOff,
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

const STATUS_BADGE: Record<string, string> = {
    Submitted: "bg-amber-100 text-amber-700 border-amber-200",
    "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
    Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Closed: "bg-gray-100 text-gray-600 border-gray-200",
    Assigned: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function CommunityPage() {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [votingId, setVotingId] = useState<string | null>(null);

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

    const handleVote = async (id: string) => {
        setVotingId(id);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
            alert(t("login") + " required");
            setVotingId(null);
            return;
        }

        try {
            const res = await fetch(`${API}/complaints/${id}/upvote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === id
                            ? { ...post, upvotes: post.upvotes + (data.voted ? 1 : -1), voted: data.voted }
                            : post
                    )
                );
            } else {
                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === id
                            ? { ...post, upvotes: post.voted ? post.upvotes - 1 : post.upvotes + 1, voted: !post.voted }
                            : post
                    )
                );
            }
        } catch {
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
    };

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
        if (mins < 60) return `${mins} ${t("ago_minutes")}`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} ${t("ago_hours")}`;
        const days = Math.floor(hrs / 24);
        return `${days} ${t("ago_days")}`;
    }

    return (
        <div className="min-h-screen">
            <section className="pt-28 pb-16 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                            {t("community_feed").split(" ")[0]}{" "}
                            <span className="gradient-text">{t("community_feed").split(" ").slice(1).join(" ")}</span>
                        </h1>
                        <p className="text-muted-foreground">
                            {t("community_feed_subtitle")}
                        </p>
                    </motion.div>

                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="flex-1 relative">
                            <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={t("search_community")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-border text-sm focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/60"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSort("newest")}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${sort === "newest"
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                                    }`}
                            >
                                <Sparkles className="size-3.5" />
                                {t("newest")}
                            </button>
                            <button
                                onClick={() => setSort("most_voted")}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${sort === "most_voted"
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                                    }`}
                            >
                                <TrendingUp className="size-3.5" />
                                {t("most_voted")}
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="size-10 text-primary animate-spin" />
                        </div>
                    )}

                    {/* Posts */}
                    {!loading && (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {filtered.map((post, i) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="bg-card border border-border/50 rounded-2xl p-5 flex gap-4 hover:border-border transition-colors"
                                    >
                                        {/* Vote Column */}
                                        <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                                            <button
                                                onClick={() => handleVote(post.id)}
                                                disabled={votingId === post.id}
                                                className={`p-2 rounded-xl transition-all ${post.voted
                                                        ? "bg-primary/15 text-primary"
                                                        : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                                    }`}
                                            >
                                                <ArrowUp className="size-5" />
                                            </button>
                                            <span className={`text-lg font-bold tabular-nums ${post.voted ? "text-primary" : ""}`}>
                                                {post.upvotes}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h3 className="font-semibold text-foreground leading-tight">{post.title}</h3>
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${STATUS_BADGE[post.status] || "bg-muted text-muted-foreground border-border"
                                                        }`}
                                                >
                                                    {post.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {post.description}
                                            </p>

                                            {post.photo_url && (
                                                <div className="mb-3 rounded-xl overflow-hidden border border-border/30 max-h-48">
                                                    <img
                                                        src={post.photo_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <span className="bg-muted/60 px-2.5 py-0.5 rounded-full font-medium">
                                                    {post.category}
                                                </span>
                                                {post.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="size-3" />
                                                        {post.address.length > 30 ? post.address.substring(0, 30) + "…" : post.address}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    {post.is_anonymous ? <EyeOff className="size-3" /> : <UserIcon className="size-3" />}
                                                    {post.is_anonymous ? t("anonymous_citizen") : post.reporter_name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {timeAgo(post.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            <MessageSquare className="size-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium mb-1">{t("no_community_posts")}</p>
                            <p className="text-sm mb-4">{t("be_first_share")}</p>
                            <Link href="/report">
                                <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                                    {t("report_an_issue")}
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}
