"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUp, ArrowDown, MessageSquare, Filter, Loader2, TrendingUp,
    Clock, MapPin, User, Search,
} from "lucide-react";
import PollCard from "@/components/poll-card";

interface Issue {
    id: number;
    title: string;
    description: string;
    status: string;
    category: string;
    address: string;
    upvotes: number;
    reporter_name: string;
    created_at: string;
    voted?: boolean;
}

const SORT_OPTIONS = ["Most Voted", "Newest", "Oldest"];
const STATUS_BADGE: Record<string, string> = {
    Submitted: "bg-amber-400/10 text-amber-400",
    "In Progress": "bg-blue-400/10 text-blue-400",
    Resolved: "bg-emerald-400/10 text-emerald-400",
    Closed: "bg-gray-400/10 text-gray-400",
};

export default function CommunityVotingPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("Most Voted");
    const [searchQuery, setSearchQuery] = useState("");
    const [votingId, setVotingId] = useState<number | null>(null);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        fetch(`${API}/complaints`)
            .then((r) => r.json())
            .then((data) => {
                const raw = data?.data?.complaints || data;
                if (Array.isArray(raw)) {
                    setIssues(raw.map((c: any) => ({
                        id: c.id,
                        title: c.title || "Untitled",
                        description: c.description || "",
                        status: c.status || "Submitted",
                        category: c.category || "General",
                        address: c.address || "",
                        upvotes: c.upvotes || 0,
                        reporter_name: c.reporter_name || "Anonymous",
                        created_at: c.created_at,
                        voted: false,
                    })));
                }
            })
            .catch(() => {
                setIssues([
                    { id: 1, title: "Fix pothole on MG Road", description: "A dangerous pothole near the market area causing accidents.", status: "Submitted", category: "Pothole", address: "MG Road, Sector 15", upvotes: 24, reporter_name: "Amit K.", created_at: "2026-02-10T10:00:00", voted: false },
                    { id: 2, title: "Install street lights near school", description: "Children walk home in complete darkness after evening classes.", status: "In Progress", category: "Street Light", address: "School Road, Civil Lines", upvotes: 18, reporter_name: "Priya S.", created_at: "2026-02-09T15:00:00", voted: false },
                    { id: 3, title: "Garbage collection missed 5 days", description: "Garbage piling up and causing health hazards in the neighborhood.", status: "Submitted", category: "Garbage", address: "Gandhi Nagar Colony", upvotes: 31, reporter_name: "Rahul M.", created_at: "2026-02-08T08:30:00", voted: false },
                    { id: 4, title: "Water pipeline burst", description: "Major water leakage flooding the street for 2 days.", status: "Resolved", category: "Water", address: "Station Road", upvotes: 42, reporter_name: "Sunita D.", created_at: "2026-02-07T12:00:00", voted: false },
                    { id: 5, title: "Broken footpath near park", description: "Senior citizens cannot walk safely due to broken tiles.", status: "Submitted", category: "Infrastructure", address: "City Park Area", upvotes: 15, reporter_name: "Vikram P.", created_at: "2026-02-11T09:00:00", voted: false },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleVote = async (id: number) => {
        setVotingId(id);
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        try {
            const res = await fetch(`${API}/complaints/${id}/upvote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (res.ok) {
                const data = await res.json();
                setIssues((prev) =>
                    prev.map((issue) =>
                        issue.id === id
                            ? { ...issue, upvotes: issue.upvotes + (data.voted ? 1 : -1), voted: data.voted }
                            : issue
                    )
                );
            } else {
                // Optimistic toggle for demo
                setIssues((prev) =>
                    prev.map((issue) =>
                        issue.id === id
                            ? { ...issue, upvotes: issue.voted ? issue.upvotes - 1 : issue.upvotes + 1, voted: !issue.voted }
                            : issue
                    )
                );
            }
        } catch {
            setIssues((prev) =>
                prev.map((issue) =>
                    issue.id === id
                        ? { ...issue, upvotes: issue.voted ? issue.upvotes - 1 : issue.upvotes + 1, voted: !issue.voted }
                        : issue
                )
            );
        } finally {
            setVotingId(null);
        }
    };

    const filtered = issues
        .filter((i) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.address.toLowerCase().includes(q);
        })
        .sort((a, b) => {
            if (sort === "Most Voted") return b.upvotes - a.upvotes;
            if (sort === "Newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="size-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                        Community <span className="gradient-text">Voting</span>
                    </h1>
                    <p className="text-muted-foreground">Upvote the issues that matter most. Your voice drives priority.</p>
                </motion.div>

                {/* Poll Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <PollCard />
                </motion.div>

                {/* Search & Sort */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search issues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/30 placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setSort(opt)}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${sort === opt
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Issues List */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {filtered.map((issue, i) => (
                            <motion.div
                                key={issue.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 flex gap-4"
                            >
                                {/* Vote Button */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleVote(issue.id)}
                                        disabled={votingId === issue.id}
                                        className={`p-2 rounded-xl transition-all ${issue.voted
                                            ? "bg-primary/20 text-primary"
                                            : "bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                            }`}
                                    >
                                        <ArrowUp className="size-5" />
                                    </button>
                                    <span className={`text-lg font-bold tabular-nums ${issue.voted ? "text-primary" : ""}`}>{issue.upvotes}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold">{issue.title}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE[issue.status] || "bg-white/10 text-muted-foreground"}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {issue.category && (
                                            <span className="bg-white/5 px-2 py-0.5 rounded-full">{issue.category}</span>
                                        )}
                                        {issue.address && (
                                            <span className="flex items-center gap-1"><MapPin className="size-3" />{issue.address}</span>
                                        )}
                                        <span className="flex items-center gap-1"><User className="size-3" />{issue.reporter_name}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3" />
                                            {new Date(issue.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <MessageSquare className="size-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">No issues found</p>
                        <p className="text-sm">Try a different search or check back later.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
