"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart, Search, MapPin, Phone, Clock, AlertTriangle,
    Droplets, PawPrint, Car, HelpCircle, Plus, X, CheckCircle,
    Loader2, Send, Users, Shield, Siren,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";

const HELP_CATEGORIES = [
    { id: "blood", label: "Blood Request", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", gradient: "from-rose-500/20 to-rose-600/10" },
    { id: "lost_found", label: "Lost & Found", icon: Search, color: "text-amber-400", bg: "bg-amber-500/10", gradient: "from-amber-500/20 to-amber-600/10" },
    { id: "accident", label: "Accident Help", icon: Car, color: "text-orange-400", bg: "bg-orange-500/10", gradient: "from-orange-500/20 to-orange-600/10" },
    { id: "water", label: "Emergency Water", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", gradient: "from-blue-500/20 to-blue-600/10" },
    { id: "medical", label: "Medical Aid", icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", gradient: "from-emerald-500/20 to-emerald-600/10" },
    { id: "general", label: "General Help", icon: HelpCircle, color: "text-purple-400", bg: "bg-purple-500/10", gradient: "from-purple-500/20 to-purple-600/10" },
];

interface HelpRequest {
    id: number; type: string; title: string; description: string;
    location: string; contact: string; time: string; urgent: boolean;
}

// Community help requests — fetched from backend when available
const MOCK_REQUESTS: HelpRequest[] = [];

export default function CommunityHelpPage() {
    const [filter, setFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = MOCK_REQUESTS.filter((r) => {
        if (filter !== "all" && r.type !== filter) return false;
        if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getCat = (type: string) => HELP_CATEGORIES.find((c) => c.id === type) || HELP_CATEGORIES[5];

    return (
        <div className="min-h-screen">
            <div className="pt-24 pb-12 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-rose-500/15 to-purple-500/15 mb-4">
                            <Users className="size-10 text-rose-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-3">
                            Community <span className="gradient-text">Help</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                            Not every problem needs a government. Help your neighbors — be the change.
                        </p>
                    </motion.div>

                    {/* Category Pills */}
                    <div className="flex flex-wrap items-center gap-2 justify-center mb-6">
                        <button
                            onClick={() => setFilter("all")}
                            className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all",
                                filter === "all" ? "bg-primary/10 text-primary border border-primary/20" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                            )}
                        >
                            All Requests
                        </button>
                        {HELP_CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setFilter(c.id)}
                                className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                                    filter === c.id ? `${c.bg} ${c.color} border border-current/20` : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                                )}
                            >
                                <c.icon className="size-3.5" /> {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Search + New Request */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card/50 border-border/20 rounded-xl"
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-medium text-sm flex items-center gap-2 shrink-0"
                        >
                            <Plus className="size-4" /> Post Request
                        </motion.button>
                    </div>

                    {/* Submit Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-8"
                            >
                                {submitted ? (
                                    <div className="glass-card p-8 text-center">
                                        <CheckCircle className="size-12 text-emerald-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-semibold mb-1">Request Posted!</h3>
                                        <p className="text-sm text-muted-foreground">Your community help request is now visible to others.</p>
                                    </div>
                                ) : (
                                    <Card className="glass-card border-border/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between text-lg">
                                                <span>Post a Help Request</span>
                                                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-white/5"><X className="size-4" /></button>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Input placeholder="Title (e.g., B+ Blood Needed)" className="bg-white/5 border-border/20 rounded-xl" />
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Location"
                                                        className="bg-white/5 border-border/20 rounded-xl pr-10"
                                                        defaultValue={searchQuery} // Mock binding
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (navigator.geolocation) {
                                                                navigator.geolocation.getCurrentPosition(() => {
                                                                    // Mock filling location
                                                                    const locInput = document.querySelector('input[placeholder="Location"]') as HTMLInputElement;
                                                                    if (locInput) locInput.value = "Current Location (Detected)";
                                                                });
                                                            }
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-emerald-400 transition-colors"
                                                        title="Auto-detect location"
                                                    >
                                                        <MapPin className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <Textarea placeholder="Describe what help you need..." className="bg-white/5 border-border/20 rounded-xl mb-4" rows={3} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <Input placeholder="Contact Number" className="bg-white/5 border-border/20 rounded-xl" />
                                                <select className="w-full rounded-xl bg-white/5 border border-border/20 px-3 py-2 text-sm">
                                                    <option value="">Select Category</option>
                                                    {HELP_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <input type="checkbox" className="rounded" />
                                                    Mark as Urgent
                                                </label>
                                                <button
                                                    onClick={() => setSubmitted(true)}
                                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-medium text-sm flex items-center gap-2"
                                                >
                                                    <Send className="size-4" /> Submit
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Requests Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((req, i) => {
                            const cat = getCat(req.type);
                            return (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className={cn("glass-card border-border/20 hover:border-primary/20 transition-all", req.urgent && "border-rose-500/30")}>
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-3 rounded-xl shrink-0", cat.bg, cat.color)}>
                                                    <cat.icon className="size-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-sm truncate">{req.title}</h3>
                                                        {req.urgent && (
                                                            <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/20 text-[10px] shrink-0">
                                                                URGENT
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{req.description}</p>
                                                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                                                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {req.location}</span>
                                                        <span className="flex items-center gap-1"><Clock className="size-3" /> {req.time}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                                                        <a href={`tel:${req.contact}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                                                            <Phone className="size-3" /> {req.contact}
                                                        </a>
                                                        <button className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                                            <Shield className="size-3" /> I Can Help
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <HelpCircle className="size-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No requests found. Be the first to ask for help!</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
