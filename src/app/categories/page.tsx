"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Trash2,
    Droplets,
    Zap,
    Construction,
    Lightbulb,
    Shield,
    Wrench,
    ArrowRight,
    PawPrint,
    HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";

const categories = [
    {
        id: "garbage",
        label: "Garbage / Waste Management",
        description: "Report overflowing bins, missed pickups, illegal dumping, and waste management issues.",
        icon: Trash2,
        gradient: "from-emerald-500/10 to-emerald-500/5",
        border: "hover:border-emerald-500/40",
        iconBg: "bg-emerald-500/15 text-emerald-600",
        accent: "text-emerald-600",
        hoverBg: "group-hover:bg-emerald-50",
    },
    {
        id: "water",
        label: "Water Leakage / Supply",
        description: "Report pipe bursts, low pressure, contaminated supply, or water leakage problems.",
        icon: Droplets,
        gradient: "from-blue-500/10 to-blue-500/5",
        border: "hover:border-blue-500/40",
        iconBg: "bg-blue-500/15 text-blue-600",
        accent: "text-blue-600",
        hoverBg: "group-hover:bg-blue-50",
    },
    {
        id: "electricity",
        label: "Electricity / Power Supply",
        description: "Report outages, voltage fluctuations, exposed wiring, or transformer issues.",
        icon: Zap,
        gradient: "from-amber-500/10 to-amber-500/5",
        border: "hover:border-amber-500/40",
        iconBg: "bg-amber-500/15 text-amber-600",
        accent: "text-amber-600",
        hoverBg: "group-hover:bg-amber-50",
    },
    {
        id: "road",
        label: "Road Damage / Potholes",
        description: "Report potholes, cracks, broken speed bumps, or road infrastructure damage.",
        icon: Construction,
        gradient: "from-slate-500/10 to-slate-500/5",
        border: "hover:border-slate-400/40",
        iconBg: "bg-slate-500/15 text-slate-600",
        accent: "text-slate-600",
        hoverBg: "group-hover:bg-slate-50",
    },
    {
        id: "streetlights",
        label: "Street Lights",
        description: "Report non-functional, flickering, or damaged street lights in your area.",
        icon: Lightbulb,
        gradient: "from-violet-500/10 to-violet-500/5",
        border: "hover:border-violet-500/40",
        iconBg: "bg-violet-500/15 text-violet-600",
        accent: "text-violet-600",
        hoverBg: "group-hover:bg-violet-50",
    },
    {
        id: "safety",
        label: "Public Safety",
        description: "Report safety hazards, broken railings, unsafe construction, or security concerns.",
        icon: Shield,
        gradient: "from-rose-500/10 to-rose-500/5",
        border: "hover:border-rose-500/40",
        iconBg: "bg-rose-500/15 text-rose-600",
        accent: "text-rose-600",
        hoverBg: "group-hover:bg-rose-50",
    },
    {
        id: "drainage",
        label: "Drainage / Sewer",
        description: "Report blocked drains, sewage overflows, waterlogging, or drainage failures.",
        icon: Wrench,
        gradient: "from-orange-500/10 to-orange-500/5",
        border: "hover:border-orange-500/40",
        iconBg: "bg-orange-500/15 text-orange-600",
        accent: "text-orange-600",
        hoverBg: "group-hover:bg-orange-50",
    },
    {
        id: "stray-animals",
        label: "Stray Animals",
        description: "Report stray animal sightings, aggressive animals, or animal rescue needs.",
        icon: PawPrint,
        gradient: "from-teal-500/10 to-teal-500/5",
        border: "hover:border-teal-500/40",
        iconBg: "bg-teal-500/15 text-teal-600",
        accent: "text-teal-600",
        hoverBg: "group-hover:bg-teal-50",
    },
    {
        id: "other",
        label: "Other",
        description: "Report any civic issue not listed above. We'll route it to the right department.",
        icon: HelpCircle,
        gradient: "from-indigo-500/10 to-indigo-500/5",
        border: "hover:border-indigo-500/40",
        iconBg: "bg-indigo-500/15 text-indigo-600",
        accent: "text-indigo-600",
        hoverBg: "group-hover:bg-indigo-50",
    },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen">
            <section className="pt-28 pb-20 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-14"
                    >
                        <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
                            Issue <span className="gradient-text">Categories</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Select a category to report an issue. Each category is routed to the
                            right authority for faster resolution.
                        </p>
                    </motion.div>

                    {/* Category Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {categories.map((cat, i) => {
                            const Icon = cat.icon;
                            return (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/report?category=${cat.id}`}>
                                        <div
                                            className={cn(
                                                "group relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-6",
                                                cat.border
                                            )}
                                        >
                                            {/* Subtle gradient background */}
                                            <div className={cn(
                                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                                cat.gradient
                                            )} />

                                            <div className="relative z-10">
                                                {/* Icon */}
                                                <div
                                                    className={cn(
                                                        "mb-4 inline-flex items-center justify-center size-12 rounded-xl transition-transform duration-300 group-hover:scale-110",
                                                        cat.iconBg
                                                    )}
                                                >
                                                    <Icon className="size-6" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-lg font-semibold font-[family-name:var(--font-outfit)] mb-2 text-foreground">
                                                    {cat.label}
                                                </h3>

                                                {/* Description */}
                                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                                    {cat.description}
                                                </p>

                                                {/* CTA */}
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-sm font-medium transition-all duration-300",
                                                    cat.accent
                                                )}>
                                                    Report Issue
                                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
