"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building, Users, DollarSign, Award, RotateCcw, TrendingUp, Shield,
    Heart, Lightbulb, Target, Star, Clock, ChevronRight, Zap, Trophy, Medal,
} from "lucide-react";

// ─── Scenario Data (inline for simplicity) ───
const SCENARIOS = [
    {
        id: "park_renovation",
        title: "Community Park Renovation",
        difficulty: "Easy",
        description: "Central Park has been neglected for years. How would you allocate the ₹50L budget?",
        budget: 5000000,
        decisions: [
            { key: "playground", title: "Playground Equipment", desc: "New playground equipment for children", min: 0, max: 1500000, step: 100000 },
            { key: "paths", title: "Path Maintenance", desc: "Repair and improve walking paths", min: 0, max: 1000000, step: 50000 },
            { key: "lighting", title: "Security Lighting", desc: "Install safety lighting throughout", min: 0, max: 800000, step: 50000 },
            { key: "garden", title: "Community Garden", desc: "Create a community garden space", min: 0, max: 700000, step: 50000 },
        ],
    },
    {
        id: "traffic",
        title: "Downtown Traffic Solutions",
        difficulty: "Medium",
        description: "Downtown traffic has increased 40%. Balance transit, bikes, and roads with ₹2Cr budget.",
        budget: 20000000,
        decisions: [
            { key: "transit", title: "Public Transit Expansion", desc: "Invest in bus routes and infrastructure", min: 0, max: 8000000, step: 500000 },
            { key: "bikes", title: "Bike Lane Network", desc: "Create protected bike lanes", min: 0, max: 4000000, step: 250000 },
            { key: "roads", title: "Road Infrastructure", desc: "Road widening and signal improvements", min: 0, max: 6000000, step: 500000 },
            { key: "parking", title: "Parking Solutions", desc: "Build or improve parking facilities", min: 0, max: 4000000, step: 250000 },
        ],
    },
    {
        id: "climate",
        title: "Climate Change Adaptation",
        difficulty: "Hard",
        description: "Prepare the city for flooding and extreme weather with ₹5Cr budget.",
        budget: 50000000,
        decisions: [
            { key: "flood", title: "Flood Protection Systems", desc: "Levees, storm drains, flood barriers", min: 0, max: 20000000, step: 1000000 },
            { key: "green", title: "Green Infrastructure", desc: "Natural flood management", min: 0, max: 15000000, step: 1000000 },
            { key: "emergency", title: "Emergency Response", desc: "Upgrade emergency systems", min: 0, max: 8000000, step: 500000 },
            { key: "renewable", title: "Renewable Energy", desc: "City renewable energy projects", min: 0, max: 12000000, step: 1000000 },
        ],
    },
    {
        id: "housing",
        title: "Affordable Housing Initiative",
        difficulty: "Hard",
        description: "Housing costs rose 35% in 3 years. Address the crisis with ₹3Cr budget.",
        budget: 30000000,
        decisions: [
            { key: "affordable", title: "New Affordable Housing", desc: "Build affordable housing units", min: 0, max: 15000000, step: 1000000 },
            { key: "rental", title: "Rental Assistance", desc: "Direct rental assistance to families", min: 0, max: 5000000, step: 250000 },
            { key: "buyers", title: "First-Time Buyer Support", desc: "Down payment assistance programs", min: 0, max: 4000000, step: 250000 },
            { key: "infrastructure", title: "Housing Infrastructure", desc: "Roads, utilities for new developments", min: 0, max: 6000000, step: 500000 },
        ],
    },
];

function formatBudget(n: number) {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString()}`;
}

function calculateResults(scenario: typeof SCENARIOS[0], decisions: Record<string, number>) {
    const spent = Object.values(decisions).reduce((a, b) => a + b, 0);
    const efficiency = Math.round((spent / scenario.budget) * 100);
    const balance = Math.max(0, 100 - Math.abs(efficiency - 85) * 2);
    const coverage = Object.values(decisions).filter((v) => v > 0).length;
    const coverageScore = Math.round((coverage / scenario.decisions.length) * 100);
    const overall = Math.round((balance + coverageScore + (efficiency > 70 ? 20 : 0)) / 2);

    let style = "Balanced Leader";
    const sorted = Object.entries(decisions).sort((a, b) => b[1] - a[1]);
    if (sorted[0] && sorted[0][1] > scenario.budget * 0.5) style = "Focused Strategist";
    if (coverage === scenario.decisions.length) style = "Inclusive Planner";
    if (efficiency > 95) style = "Budget Maximizer";

    const xp = Math.round(overall * 0.5) + 20 + (efficiency > 90 ? 15 : 0);

    return { overall, efficiency, coverageScore, style, xp, spent };
}

type Phase = "select" | "decide" | "result";

export default function CivicSimulatorPage() {
    const [phase, setPhase] = useState<Phase>("select");
    const [scenario, setScenario] = useState<typeof SCENARIOS[0] | null>(null);
    const [decisions, setDecisions] = useState<Record<string, number>>({});
    const [results, setResults] = useState<ReturnType<typeof calculateResults> | null>(null);
    const [totalXp, setTotalXp] = useState(0);
    const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("civicSim");
        if (saved) {
            const d = JSON.parse(saved);
            setTotalXp(d.xp || 0);
            setCompletedScenarios(d.completed || []);
        }
    }, []);

    const selectScenario = (s: typeof SCENARIOS[0]) => {
        setScenario(s);
        const init: Record<string, number> = {};
        s.decisions.forEach((d) => (init[d.key] = 0));
        setDecisions(init);
        setPhase("decide");
    };

    const handleSlider = (key: string, val: number) => {
        setDecisions((prev) => ({ ...prev, [key]: val }));
    };

    const submitDecisions = () => {
        if (!scenario) return;
        const r = calculateResults(scenario, decisions);
        setResults(r);
        setPhase("result");
        const newXp = totalXp + r.xp;
        const newCompleted = [...new Set([...completedScenarios, scenario.id])];
        setTotalXp(newXp);
        setCompletedScenarios(newCompleted);
        localStorage.setItem("civicSim", JSON.stringify({ xp: newXp, completed: newCompleted }));
    };

    const reset = () => {
        setPhase("select");
        setScenario(null);
        setDecisions({});
        setResults(null);
    };

    const spent = Object.values(decisions).reduce((a, b) => a + b, 0);
    const remaining = scenario ? scenario.budget - spent : 0;

    const diffColor = (d: string) =>
        d === "Easy" ? "text-emerald-400 bg-emerald-400/10" :
            d === "Medium" ? "text-amber-400 bg-amber-400/10" :
                "text-rose-400 bg-rose-400/10";

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
                        Civic <span className="gradient-text">Simulator</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Step into a civic leadership role. Make tough decisions and see their impact.
                    </p>
                </motion.div>

                {/* XP Banner */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-400/10 text-amber-400 p-2 rounded-xl"><Trophy className="size-5" /></div>
                        <div>
                            <div className="font-semibold">{totalXp} XP earned</div>
                            <div className="text-xs text-muted-foreground">{completedScenarios.length}/{SCENARIOS.length} scenarios completed</div>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {SCENARIOS.map((s) => (
                            <div key={s.id} className={`w-3 h-3 rounded-full ${completedScenarios.includes(s.id) ? "bg-emerald-400" : "bg-white/10"}`} />
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* ─── SELECT PHASE ─── */}
                    {phase === "select" && (
                        <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {SCENARIOS.map((s, i) => (
                                <motion.button
                                    key={s.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => selectScenario(s)}
                                    className="glass-card p-6 text-left group hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${diffColor(s.difficulty)}`}>{s.difficulty}</span>
                                        {completedScenarios.includes(s.id) && <Medal className="size-4 text-emerald-400" />}
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><DollarSign className="size-3" /> Budget: {formatBudget(s.budget)}</span>
                                        <span className="flex items-center gap-1"><Target className="size-3" /> {s.decisions.length} decisions</span>
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {/* ─── DECIDE PHASE ─── */}
                    {phase === "decide" && scenario && (
                        <motion.div key="decide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="glass-card p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{scenario.title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${diffColor(scenario.difficulty)}`}>{scenario.difficulty}</span>
                                </div>

                                {/* Budget Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Budget Used: {formatBudget(spent)}</span>
                                        <span className={remaining < 0 ? "text-rose-400" : "text-muted-foreground"}>
                                            Remaining: {formatBudget(Math.max(0, remaining))}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${spent > scenario.budget ? "bg-rose-400" : "bg-primary"}`}
                                            animate={{ width: `${Math.min((spent / scenario.budget) * 100, 100)}%` }}
                                        />
                                    </div>
                                    {spent > scenario.budget && (
                                        <p className="text-xs text-rose-400 mt-1">⚠️ Over budget by {formatBudget(spent - scenario.budget)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Decision Sliders */}
                            <div className="space-y-4 mb-6">
                                {scenario.decisions.map((d, i) => (
                                    <motion.div
                                        key={d.key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card p-5"
                                    >
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h4 className="font-semibold">{d.title}</h4>
                                                <p className="text-xs text-muted-foreground">{d.desc}</p>
                                            </div>
                                            <span className="text-primary font-mono font-semibold">{formatBudget(decisions[d.key] || 0)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={d.min}
                                            max={d.max}
                                            step={d.step}
                                            value={decisions[d.key] || 0}
                                            onChange={(e) => handleSlider(d.key, parseInt(e.target.value))}
                                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>{formatBudget(d.min)}</span>
                                            <span>{formatBudget(d.max)}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button onClick={reset} className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all font-medium">
                                    Cancel
                                </button>
                                <button
                                    onClick={submitDecisions}
                                    disabled={spent > scenario.budget}
                                    className="px-8 py-2.5 rounded-full bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Decisions
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── RESULT PHASE ─── */}
                    {phase === "result" && results && scenario && (
                        <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <div className="glass-card p-8 text-center mb-6">
                                <div className="text-6xl mb-4">{results.overall >= 80 ? "🏆" : results.overall >= 60 ? "⭐" : "📊"}</div>
                                <h2 className="text-3xl font-bold mb-2">Simulation Complete!</h2>
                                <div className="text-5xl font-bold my-4">
                                    <span className={results.overall >= 70 ? "text-emerald-400" : results.overall >= 50 ? "text-amber-400" : "text-rose-400"}>
                                        {results.overall}
                                    </span>
                                    <span className="text-muted-foreground text-xl">/100</span>
                                </div>
                                <p className="text-muted-foreground mb-2">Civic Style: <span className="text-primary font-semibold">{results.style}</span></p>
                                <p className="text-sm text-amber-400">+{results.xp} XP earned</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="glass-card p-5 text-center">
                                    <DollarSign className="size-6 text-emerald-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{results.efficiency}%</div>
                                    <div className="text-xs text-muted-foreground">Budget Efficiency</div>
                                </div>
                                <div className="glass-card p-5 text-center">
                                    <Target className="size-6 text-blue-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{results.coverageScore}%</div>
                                    <div className="text-xs text-muted-foreground">Category Coverage</div>
                                </div>
                                <div className="glass-card p-5 text-center">
                                    <TrendingUp className="size-6 text-amber-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{formatBudget(results.spent)}</div>
                                    <div className="text-xs text-muted-foreground">Total Allocated</div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <button onClick={reset} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium transition-all hover:scale-105">
                                    <RotateCcw className="size-4" /> Try Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
