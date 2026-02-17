"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, ChevronUp, BookOpen, CheckCircle, XCircle, RotateCcw, CheckCircle2, ShieldCheck,
    Trophy, Star, Brain, Target, Lightbulb, Award, Clock, TrendingUp,
    Bookmark, Sparkles, Rocket, Medal, Crown, Flame, Download, Play,
    Gift, Zap, Globe, Shield, Scale, FileText, AlertTriangle, Camera, MapPin, List,
} from "lucide-react";

// ─── Data ───
const CIVIC_SECTIONS = [
    {
        id: "rights",
        title: "Fundamental Rights",
        icon: Shield,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        content: "Every citizen is guaranteed fundamental rights including the Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and the Right to Constitutional Remedies. These rights are enforceable by courts and form the bedrock of a democratic society.",
        facts: [
            "The Right to Education was added as a fundamental right in 2002",
            "Article 21 guarantees the Right to Life and Personal Liberty",
            "Fundamental Rights can be suspended during a national emergency, except Articles 20 and 21",
        ],
    },
    {
        id: "duties",
        title: "Fundamental Duties",
        icon: Scale,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        content: "Added by the 42nd Amendment in 1976, Fundamental Duties include respecting the Constitution, cherishing national ideals, protecting sovereignty, promoting harmony, preserving cultural heritage, protecting the environment, developing scientific temper, safeguarding public property, and striving towards excellence.",
        facts: [
            "There are 11 Fundamental Duties listed in Article 51A",
            "The 86th Amendment added the duty of providing education opportunities to children",
            "Unlike Rights, Duties are non-justiciable – they cannot be enforced by courts directly",
        ],
    },
    {
        id: "governance",
        title: "Local Governance",
        icon: Globe,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        content: "Local governance through Panchayati Raj institutions and Municipalities brings democracy to the grassroots level. Citizens can participate in local body elections, attend gram sabha meetings, file RTI applications, and engage with local representatives to address civic issues directly.",
        facts: [
            "The 73rd and 74th Amendments strengthened local self-governance",
            "One-third of seats in local bodies are reserved for women",
            "Gram Sabha is the foundation of the Panchayati Raj system",
        ],
    },
    {
        id: "voting",
        title: "Electoral Process",
        icon: Target,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        content: "India has the largest democracy in the world. Citizens above 18 have the right to vote. Elections are conducted by the independent Election Commission. Understanding NOTA, EVMs, voter registration, and the importance of informed voting is crucial for every citizen.",
        facts: [
            "NOTA (None of the Above) was introduced in 2013",
            "The first general elections were held in 1951-52",
            "Voter ID cards were introduced in 1993 for photo identification",
        ],
    },
    {
        id: "rti",
        title: "Right to Information",
        icon: FileText,
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        content: "The RTI Act 2005 empowers citizens to seek information from public authorities. Any citizen can file an RTI application with a nominal fee. Public authorities must respond within 30 days. This powerful tool promotes transparency and accountability in governance.",
        facts: [
            "RTI applications can be filed online through the RTI portal",
            "The fee for filing an RTI is just ₹10",
            "BPL card holders are exempt from RTI fees",
        ],
    },
];

const QUIZ_QUESTIONS = [
    {
        question: "Which article of the Constitution guarantees the Right to Equality?",
        options: ["Article 12", "Article 14", "Article 19", "Article 21"],
        correct: 1,
        explanation: "Article 14 ensures equality before law and equal protection of laws within India.",
    },
    {
        question: "What is the minimum age for voting in India?",
        options: ["16 years", "18 years", "21 years", "25 years"],
        correct: 1,
        explanation: "The 61st Amendment Act of 1988 lowered the voting age from 21 to 18 years.",
    },
    {
        question: "The RTI Act was enacted in which year?",
        options: ["2000", "2003", "2005", "2010"],
        correct: 2,
        explanation: "The Right to Information Act was enacted on October 12, 2005.",
    },
    {
        question: "How many Fundamental Duties are listed in the Indian Constitution?",
        options: ["8", "10", "11", "12"],
        correct: 2,
        explanation: "There are 11 Fundamental Duties under Article 51A, the 11th being added by the 86th Amendment.",
    },
    {
        question: "Which amendment introduced Panchayati Raj institutions?",
        options: ["42nd", "44th", "73rd", "86th"],
        correct: 2,
        explanation: "The 73rd Constitutional Amendment Act of 1992 gave constitutional status to Panchayati Raj.",
    },
    {
        question: "What is NOTA in Indian elections?",
        options: [
            "New Online Tallying App",
            "None of the Above",
            "National Organization for Transparent Administration",
            "Notice of Tribunal Assessment",
        ],
        correct: 1,
        explanation: "NOTA allows voters to officially reject all candidates in an election.",
    },
    {
        question: "Within how many days must an RTI request be answered?",
        options: ["7 days", "15 days", "30 days", "60 days"],
        correct: 2,
        explanation: "Under Section 7, every public authority must provide information within 30 days of receiving the request.",
    },
    {
        question: "Which body conducts elections in India?",
        options: [
            "Supreme Court",
            "Parliament",
            "Election Commission of India",
            "President of India",
        ],
        correct: 2,
        explanation: "The Election Commission of India is an autonomous constitutional authority responsible for administering election processes.",
    },
];

const ACHIEVEMENTS = [
    { id: "first_read", name: "First Steps", icon: Rocket, desc: "Read your first section", xpReq: 10 },
    { id: "quiz_starter", name: "Quiz Starter", icon: Brain, desc: "Complete your first quiz", xpReq: 50 },
    { id: "bookworm", name: "Bookworm", icon: BookOpen, desc: "Read 3 sections", xpReq: 30 },
    { id: "scholar", name: "Scholar", icon: Award, desc: "Score 100% on a quiz", xpReq: 100 },
    { id: "dedicated", name: "Dedicated Citizen", icon: Flame, desc: "Reach 150 XP", xpReq: 150 },
    { id: "champion", name: "Civic Champion", icon: Crown, desc: "Reach 300 XP", xpReq: 300 },
];

const RESOURCES = [
    { name: "Constitution of India (PDF)", url: "https://legislative.gov.in/constitution-of-india/", icon: FileText },
    { name: "RTI Online Portal", url: "https://rtionline.gov.in/", icon: Globe },
    { name: "Election Commission", url: "https://eci.gov.in/", icon: Target },
    { name: "MyGov Citizen Platform", url: "https://www.mygov.in/", icon: Shield },
];

type TabId = "overview" | "learn" | "quiz" | "resources" | "guide" | "fines";

export default function CivicEducationPage() {
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [achievements, setAchievements] = useState<string[]>([]);
    const [sectionsRead, setSectionsRead] = useState<string[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);

    // Quiz state
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("civicEdu");
        if (saved) {
            const data = JSON.parse(saved);
            setXp(data.xp || 0);
            setLevel(data.level || 1);
            setAchievements(data.achievements || []);
            setBookmarks(data.bookmarks || []);
            setSectionsRead(data.sectionsRead || []);
        }
    }, []);

    // Save to localStorage
    const save = useCallback((data: any) => {
        localStorage.setItem("civicEdu", JSON.stringify(data));
    }, []);

    const awardXP = useCallback((pts: number) => {
        setXp((prev) => {
            const newXp = prev + pts;
            const newLevel = Math.floor(newXp / 100) + 1;
            if (newLevel > level) {
                setLevel(newLevel);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
            }
            save({ xp: newXp, level: newLevel, achievements, bookmarks, sectionsRead });
            return newXp;
        });
    }, [level, achievements, bookmarks, sectionsRead, save]);

    const toggleSection = (id: string) => {
        if (expandedSection === id) {
            setExpandedSection(null);
        } else {
            setExpandedSection(id);
            if (!sectionsRead.includes(id)) {
                const updated = [...sectionsRead, id];
                setSectionsRead(updated);
                awardXP(10);
                save({ xp: xp + 10, level, achievements, bookmarks, sectionsRead: updated });
            }
        }
    };

    const toggleBookmark = (id: string) => {
        setBookmarks((prev) => {
            const updated = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
            save({ xp, level, achievements, bookmarks: updated, sectionsRead });
            return updated;
        });
    };

    // Quiz logic
    const startQuiz = () => {
        setQuizStarted(true);
        setCurrentQ(0);
        setScore(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setQuizFinished(false);
        setAnsweredQuestions(new Array(QUIZ_QUESTIONS.length).fill(false));
    };

    const handleAnswer = (idx: number) => {
        if (showResult) return;
        setSelectedAnswer(idx);
        setShowResult(true);
        if (idx === QUIZ_QUESTIONS[currentQ].correct) {
            setScore((s) => s + 1);
        }
        const updated = [...answeredQuestions];
        updated[currentQ] = true;
        setAnsweredQuestions(updated);
    };

    const nextQuestion = () => {
        if (currentQ < QUIZ_QUESTIONS.length - 1) {
            setCurrentQ((q) => q + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizFinished(true);
            const finalScore = score + (selectedAnswer === QUIZ_QUESTIONS[currentQ].correct ? 0 : 0);
            awardXP(finalScore * 15 + 20);
        }
    };

    const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
        { id: "overview", label: "Overview", icon: Sparkles },
        { id: "learn", label: "Learn", icon: BookOpen },
        { id: "guide", label: "How to Report", icon: Target },
        { id: "fines", label: "Civic Penalties", icon: AlertTriangle },
        { id: "quiz", label: "Quiz", icon: Brain },
        { id: "resources", label: "Resources", icon: Download },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
                        Civic <span className="gradient-text">Education</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Learn about your rights, responsibilities, and how democracy works. Earn XP and unlock achievements!
                    </p>
                </motion.div>

                {/* XP Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-5 mb-8"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-400/10 text-amber-400 p-2.5 rounded-xl">
                                <Trophy className="size-6" />
                            </div>
                            <div>
                                <div className="font-semibold text-lg">Level {level}</div>
                                <div className="text-sm text-muted-foreground">{xp} XP earned</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {ACHIEVEMENTS.slice(0, 4).map((a) => (
                                <div
                                    key={a.id}
                                    className={`p-2 rounded-lg transition-all ${achievements.includes(a.id) || xp >= a.xpReq
                                        ? "bg-amber-400/20 text-amber-400"
                                        : "bg-white/5 text-muted-foreground/30"
                                        }`}
                                    title={a.name}
                                >
                                    <a.icon className="size-4" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((xp % 100), 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 text-right">
                        {100 - (xp % 100)} XP to next level
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-transparent"
                                }`}
                        >
                            <tab.icon className="size-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="glass-card p-6 text-center">
                                    <BookOpen className="size-8 text-blue-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold">{sectionsRead.length}/{CIVIC_SECTIONS.length}</div>
                                    <div className="text-sm text-muted-foreground">Sections Read</div>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <Trophy className="size-8 text-amber-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold">{xp}</div>
                                    <div className="text-sm text-muted-foreground">Total XP</div>
                                </div>
                                <div className="glass-card p-6 text-center">
                                    <Medal className="size-8 text-emerald-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold">{ACHIEVEMENTS.filter((a) => xp >= a.xpReq).length}</div>
                                    <div className="text-sm text-muted-foreground">Achievements</div>
                                </div>
                            </div>

                            {/* Did You Know Carousel */}
                            <FactCarousel />

                            {/* Achievements Grid */}
                            <div>
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Award className="size-5 text-amber-400" /> Achievements
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {ACHIEVEMENTS.map((a) => {
                                        const unlocked = xp >= a.xpReq;
                                        return (
                                            <div
                                                key={a.id}
                                                className={`glass-card p-4 flex items-center gap-3 transition-all ${unlocked ? "border-amber-400/30" : "opacity-50"
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-xl ${unlocked ? "bg-amber-400/20 text-amber-400" : "bg-white/5 text-muted-foreground/40"}`}>
                                                    <a.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{a.name}</div>
                                                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                                                </div>
                                                {unlocked && <CheckCircle className="size-4 text-emerald-400 ml-auto" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "learn" && (
                        <motion.div
                            key="learn"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {CIVIC_SECTIONS.map((section) => (
                                <div key={section.id} className="glass-card overflow-hidden">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${section.bg} ${section.color}`}>
                                                <section.icon className="size-5" />
                                            </div>
                                            <span className="font-semibold text-lg text-left">{section.title}</span>
                                            {sectionsRead.includes(section.id) && (
                                                <CheckCircle className="size-4 text-emerald-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleBookmark(section.id); }}
                                                className={`p-1.5 rounded-lg transition-colors ${bookmarks.includes(section.id) ? "text-amber-400" : "text-muted-foreground/40 hover:text-muted-foreground"
                                                    }`}
                                            >
                                                <Bookmark className="size-4" />
                                            </button>
                                            {expandedSection === section.id ? (
                                                <ChevronUp className="size-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="size-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {expandedSection === section.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-white/5 pt-4">
                                                    <p className="text-muted-foreground leading-relaxed mb-4">{section.content}</p>
                                                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                            <Lightbulb className="size-4 text-amber-400" /> Did You Know?
                                                        </h4>
                                                        <ul className="space-y-1.5">
                                                            {section.facts.map((fact, i) => (
                                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                    <Star className="size-3 text-amber-400 mt-1 shrink-0" />
                                                                    {fact}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "quiz" && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {!quizStarted ? (
                                <div className="glass-card p-10 text-center">
                                    <Brain className="size-16 text-primary mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Civic Knowledge Quiz</h3>
                                    <p className="text-muted-foreground mb-6">
                                        Test your knowledge of Indian civics. {QUIZ_QUESTIONS.length} questions, earn XP for correct answers!
                                    </p>
                                    <button
                                        onClick={startQuiz}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Play className="size-5 inline mr-2" /> Start Quiz
                                    </button>
                                </div>
                            ) : quizFinished ? (
                                <div className="glass-card p-10 text-center">
                                    <Trophy className="size-16 text-amber-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                                    <div className="text-5xl font-bold my-4">
                                        <span className={score >= QUIZ_QUESTIONS.length * 0.7 ? "text-emerald-400" : score >= QUIZ_QUESTIONS.length * 0.4 ? "text-amber-400" : "text-rose-400"}>
                                            {score}
                                        </span>
                                        <span className="text-muted-foreground text-2xl">/{QUIZ_QUESTIONS.length}</span>
                                    </div>
                                    <p className="text-muted-foreground mb-6">
                                        {score === QUIZ_QUESTIONS.length
                                            ? "Perfect score! You're a civic champion! 🎉"
                                            : score >= QUIZ_QUESTIONS.length * 0.7
                                                ? "Great job! You know your civics well!"
                                                : "Keep learning! Read the sections to improve."}
                                    </p>
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={startQuiz}
                                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105"
                                        >
                                            <RotateCcw className="size-4" /> Retry
                                        </button>
                                        <button
                                            onClick={() => { setQuizStarted(false); setActiveTab("learn"); }}
                                            className="flex items-center gap-2 bg-white/5 text-foreground px-6 py-2.5 rounded-full font-medium transition-all hover:bg-white/10"
                                        >
                                            <BookOpen className="size-4" /> Study More
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card p-8">
                                    {/* Progress */}
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-sm text-muted-foreground">
                                            Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
                                        </span>
                                        <span className="text-sm font-medium text-primary">{score} correct</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            animate={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                                        />
                                    </div>

                                    {/* Question */}
                                    <h3 className="text-xl font-semibold mb-6">{QUIZ_QUESTIONS[currentQ].question}</h3>

                                    {/* Options */}
                                    <div className="space-y-3 mb-6">
                                        {QUIZ_QUESTIONS[currentQ].options.map((opt, i) => {
                                            const isCorrect = i === QUIZ_QUESTIONS[currentQ].correct;
                                            const isSelected = i === selectedAnswer;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleAnswer(i)}
                                                    disabled={showResult}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${showResult
                                                        ? isCorrect
                                                            ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                                                            : isSelected
                                                                ? "bg-rose-400/10 border-rose-400/30 text-rose-400"
                                                                : "bg-white/[0.02] border-white/5 text-muted-foreground"
                                                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-primary/20"
                                                        }`}
                                                >
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${showResult && isCorrect ? "bg-emerald-400/20" : showResult && isSelected ? "bg-rose-400/20" : "bg-white/10"
                                                        }`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    {opt}
                                                    {showResult && isCorrect && <CheckCircle className="size-5 ml-auto shrink-0" />}
                                                    {showResult && isSelected && !isCorrect && <XCircle className="size-5 ml-auto shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation */}
                                    {showResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6"
                                        >
                                            <p className="text-sm text-muted-foreground">
                                                <Lightbulb className="size-4 text-amber-400 inline mr-2" />
                                                {QUIZ_QUESTIONS[currentQ].explanation}
                                            </p>
                                        </motion.div>
                                    )}

                                    {showResult && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={nextQuestion}
                                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium transition-all hover:scale-105"
                                            >
                                                {currentQ < QUIZ_QUESTIONS.length - 1 ? "Next Question" : "See Results"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}



                    {activeTab === "guide" && (
                        <motion.div
                            key="guide"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-8">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Target className="size-8 text-primary" />
                                    How to Report an Issue Effectively
                                </h3>
                                <p className="text-muted-foreground mb-8">
                                    A high-quality report gets resolved 3x faster. Follow these steps to become a verified reporter.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <div className="bg-primary/10 text-primary p-3 rounded-full h-fit shrink-0">
                                                <Camera className="size-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg mb-2">1. Click a Clear Photo</h4>
                                                <p className="text-sm text-muted-foreground">Ensure good lighting. Avoid blurry images. Capture the surrounding area for context.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="bg-primary/10 text-primary p-3 rounded-full h-fit shrink-0">
                                                <MapPin className="size-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg mb-2">2. Pin Exact Location</h4>
                                                <p className="text-sm text-muted-foreground">Use the GPS locator. Adjust the pin manually if needed to point exactly to the issue.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="bg-primary/10 text-primary p-3 rounded-full h-fit shrink-0">
                                                <List className="size-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg mb-2">3. Detailed Description</h4>
                                                <p className="text-sm text-muted-foreground">Describe the problem clearly. Mention how long it has been there. Avoid abusive language.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                                            <ShieldCheck className="size-5 text-emerald-400" />
                                            Do's and Don'ts
                                        </h4>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Do take multiple photos if possible</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                                <span>Do select the correct category (e.g., Pothole vs Road)</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <XCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                                <span>Don't upload fake or downloaded images</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <XCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                                                <span>Don't report personal disputes as civic issues</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "fines" && (
                        <motion.div
                            key="fines"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="glass-card p-6">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <AlertTriangle className="size-8 text-amber-400" />
                                    Common Civic Penalties (India)
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Awareness of penalties encourages responsible citizenship. Fines may vary by municipality.
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { offense: "Littering in Public Places", fine: "₹200 - ₹5,000", section: "Solid Waste Management Rules, 2016" },
                                        { offense: "Spitting in Public", fine: "₹100 - ₹1,000", section: "State Municipal Acts" },
                                        { offense: "Open Defecation / Urination", fine: "₹100 - ₹500", section: "Swachh Bharat Norms" },
                                        { offense: "Not Segregating Waste", fine: "₹200 - ₹500", section: "SWM Rules (User Fee)" },
                                        { offense: "Using Banned Plastic Bags", fine: "₹500 - ₹25,000", section: "Plastic Waste Management Rules" },
                                        { offense: "Burning Garbage/Leaves", fine: "₹5,000 - ₹25,000", section: "NGT Orders" },
                                        { offense: "Defacing Public Property", fine: "Up to ₹50,050 + Jail", section: "Prevention of Damage to Public Property Act" },
                                        { offense: "Traffic Violation (No Helmet)", fine: "₹1,000 + License Suspend", section: "Motor Vehicles Act, 2019" },
                                        { offense: "Traffic Violation (Signal Jump)", fine: "₹1,000 - ₹5,000", section: "Motor Vehicles Act, 2019" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div>
                                                <div className="font-semibold text-lg text-foreground/90">{item.offense}</div>
                                                <div className="text-xs text-muted-foreground">{item.section}</div>
                                            </div>
                                            <div className="mt-2 md:mt-0 font-mono font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-lg">
                                                {item.fine}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "resources" && (
                        <motion.div
                            key="resources"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-semibold mb-4">Curated Resources</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {RESOURCES.map((r) => (
                                    <a
                                        key={r.name}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glass-card p-5 flex items-center gap-4 group hover:border-primary/30 transition-all"
                                    >
                                        <div className="bg-primary/10 text-primary p-3 rounded-xl">
                                            <r.icon className="size-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium group-hover:text-primary transition-colors">{r.name}</div>
                                            <div className="text-xs text-muted-foreground">Open external resource →</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Celebration Overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <div className="glass-card p-10 text-center max-w-sm">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
                                <p className="text-muted-foreground">You reached Level {level}!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}

// ─── Fact Carousel Component ───
function FactCarousel() {
    const allFacts = CIVIC_SECTIONS.flatMap((s) => s.facts);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIdx((i) => (i + 1) % allFacts.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [allFacts.length]);

    return (
        <div className="glass-card p-5 overflow-hidden">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="size-4 text-amber-400" /> Did You Know?
            </h3>
            <AnimatePresence mode="wait">
                <motion.p
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-muted-foreground text-sm"
                >
                    {allFacts[idx]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
}
