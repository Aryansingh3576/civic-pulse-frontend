"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic,
    MapPin,
    Loader2,
    Send,
    CheckCircle2,
    X,
    Upload,
    AlertTriangle,
    Droplets,
    Lightbulb,
    Trash2,
    Construction,
    Wrench,
    Shield,
    LogIn,
    Zap,
    ArrowLeft,
    ArrowRight,
    Camera,
    FileText,
    PawPrint,
    HelpCircle,
    Brain, // Added
    Users,
    EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/location-picker"), { ssr: false });

const categories = [
    { id: "garbage", label: "Garbage / Waste", icon: Trash2, color: "emerald" },
    { id: "water", label: "Water Supply", icon: Droplets, color: "blue" },
    { id: "electricity", label: "Electricity", icon: Zap, color: "amber" },
    { id: "road", label: "Road Damage", icon: Construction, color: "slate" },
    { id: "streetlights", label: "Street Lights", icon: Lightbulb, color: "violet" },
    { id: "safety", label: "Public Safety", icon: Shield, color: "rose" },
    { id: "drainage", label: "Drainage / Sewer", icon: Wrench, color: "orange" },
    { id: "stray-animals", label: "Stray Animals", icon: PawPrint, color: "teal" },
    { id: "other", label: "Other", icon: HelpCircle, color: "indigo" },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: "bg-emerald-500/15", border: "border-emerald-500", text: "text-emerald-500" },
    blue: { bg: "bg-blue-500/15", border: "border-blue-500", text: "text-blue-500" },
    amber: { bg: "bg-amber-500/15", border: "border-amber-500", text: "text-amber-500" },
    slate: { bg: "bg-slate-500/15", border: "border-slate-400", text: "text-slate-400" },
    violet: { bg: "bg-violet-500/15", border: "border-violet-500", text: "text-violet-500" },
    rose: { bg: "bg-rose-500/15", border: "border-rose-500", text: "text-rose-500" },
    orange: { bg: "bg-orange-500/15", border: "border-orange-500", text: "text-orange-500" },
    teal: { bg: "bg-teal-500/15", border: "border-teal-500", text: "text-teal-500" },
    indigo: { bg: "bg-indigo-500/15", border: "border-indigo-500", text: "text-indigo-500" },
};

// Category-specific theme backgrounds with photos for the form
const categoryThemeMap: Record<string, { gradient: string; glow: string; photo: string }> = {
    garbage: {
        gradient: "from-emerald-950/90 via-emerald-950/70 to-emerald-900/50",
        glow: "shadow-emerald-500/10",
        photo: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&q=80&auto=format",
    },
    water: {
        gradient: "from-blue-950/90 via-blue-950/70 to-blue-900/50",
        glow: "shadow-blue-500/10",
        photo: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=800&q=80&auto=format",
    },
    electricity: {
        gradient: "from-amber-950/90 via-amber-950/70 to-amber-900/50",
        glow: "shadow-amber-500/10",
        photo: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format",
    },
    road: {
        gradient: "from-slate-950/90 via-slate-900/70 to-slate-800/50",
        glow: "shadow-slate-500/10",
        photo: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80&auto=format",
    },
    streetlights: {
        gradient: "from-violet-950/90 via-violet-950/70 to-violet-900/50",
        glow: "shadow-violet-500/10",
        photo: "https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&q=80&auto=format",
    },
    safety: {
        gradient: "from-rose-950/90 via-rose-950/70 to-rose-900/50",
        glow: "shadow-rose-500/10",
        photo: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80&auto=format",
    },
    drainage: {
        gradient: "from-orange-950/90 via-orange-950/70 to-orange-900/50",
        glow: "shadow-orange-500/10",
        photo: "https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=800&q=80&auto=format",
    },
    "stray-animals": {
        gradient: "from-teal-950/90 via-teal-950/70 to-teal-900/50",
        glow: "shadow-teal-500/10",
        photo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80&auto=format",
    },
    other: {
        gradient: "from-indigo-950/90 via-indigo-950/70 to-indigo-900/50",
        glow: "shadow-indigo-500/10",
        photo: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format",
    },
};

const steps = [
    { id: 1, label: "Category & Location", icon: MapPin },
    { id: 2, label: "Upload Proof", icon: Camera },
    { id: 3, label: "Details & Submit", icon: FileText },
];

export default function ComplaintForm() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const preselected = searchParams.get("category") || "";

    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(preselected);
    const [address, setAddress] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    // Community sharing
    const [shareToFeed, setShareToFeed] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        if (preselected) setSelectedCategory(preselected);
    }, [preselected]);

    // Auto-detect location on mount if not set
    useEffect(() => {
        if (currentStep === 1 && !address && !coords && !isLocating) {
            detectLocation();
        }
    }, [currentStep]);

    // Auto-detect location using browser Geolocation + reverse geocoding
    async function detectLocation() {
        if (!("geolocation" in navigator)) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setIsLocating(true);
        setLocationError("");
        setError("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });

                try {
                    // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                        { headers: { "Accept-Language": "en" } }
                    );
                    const data = await res.json();
                    const displayName = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
                    setAddress(displayName);
                } catch {
                    // Fallback to raw coordinates if geocoding fails
                    setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                }
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setLocationError("Location permission denied. Please allow location access in your browser settings.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setLocationError("Location unavailable. Please check your device settings.");
                        break;
                    case err.TIMEOUT:
                        setLocationError("Location request timed out. Please try again.");
                        break;
                    default:
                        setLocationError("Unable to detect location. Please try again.");
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<{ category: string; severity: string; confidence: number } | null>(null);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Photo must be under 5 MB");
            return;
        }
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError("");

        // Simulate AI Analysis
        setIsAnalyzing(true);
        setTimeout(() => {
            // Mock result based on random logic or filename (for demo)
            const mockCats = ["pothole", "garbage", "water", "streetlights"];
            const suggested = mockCats[Math.floor(Math.random() * mockCats.length)];

            setAiSuggestion({
                category: suggested,
                severity: "High",
                confidence: 0.92
            });

            // Auto-select category if not selected
            if (!selectedCategory) {
                // Map mock to actual IDs
                const map: Record<string, string> = { pothole: "road", garbage: "garbage", water: "water", streetlights: "streetlights" };
                if (map[suggested]) setSelectedCategory(map[suggested]);
            }
            setIsAnalyzing(false);
        }, 2500);
    }

    function removePhoto() {
        setPhoto(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
        setAiSuggestion(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleVoiceInput() {
        const win = window as any;
        const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setError("Voice input is not supported in this browser.");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        setIsRecording(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    }


    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicates, setDuplicates] = useState<any[]>([]);

    async function nextStep() {
        if (currentStep === 1) {
            if (!selectedCategory) {
                setError("Please select a category.");
                return;
            }
            if (!address.trim()) {
                setError("Please detect your location. This is required to route your report.");
                return;
            }

            // Check for duplicates
            if (coords) {
                try {
                    const res = await api.post("/complaints/check-duplicate", {
                        latitude: coords.lat,
                        longitude: coords.lng,
                        category: selectedCategory
                    });
                    if (res.data.data.duplicates && res.data.data.duplicates.length > 0) {
                        setDuplicates(res.data.data.duplicates);
                        setShowDuplicateModal(true);
                        return; // Stop navigation
                    }
                } catch (err) {
                    console.error("Duplicate check failed", err);
                    // Continue anyway if check fails
                }
            }
        }

        setError("");
        setCurrentStep((s) => Math.min(s + 1, 3));
    }

    function prevStep() {
        setError("");
        setCurrentStep((s) => Math.max(s - 1, 1));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError("Please fill in title and description.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || selectedCategory;
            await api.post("/complaints", {
                title,
                description,
                category: categoryLabel,
                address,
                latitude: coords?.lat || null,
                longitude: coords?.lng || null,
                is_public: shareToFeed,
                is_anonymous: isAnonymous,
            });
            setIsSuccess(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to submit report. Please try again.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleReset() {
        setCurrentStep(1);
        setSelectedCategory(preselected);
        setAddress("");
        setTitle("");
        setDescription("");
        setIsRecording(false);
        setPhoto(null);
        setPhotoPreview(null);
        setIsSubmitting(false);
        setIsSuccess(false);
        setError("");
    }

    // Auth Gate
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="glass-card max-w-xl mx-auto p-12 text-center border-primary/20">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <Shield className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-3">Sign In Required</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    To ensure accountability, please sign in before reporting an issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/login">
                            <LogIn className="mr-2 size-4" /> Sign In
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                        <Link href="/register">Create Account</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const activeTheme = selectedCategory ? categoryThemeMap[selectedCategory] : null;
    const activeCat = categories.find(c => c.id === selectedCategory);

    return (
        <Card className={cn("glass-card border-border/30 overflow-hidden max-w-2xl mx-auto transition-shadow duration-500", activeTheme?.glow && `shadow-xl ${activeTheme.glow}`)}>
            {/* Category Theme Banner with Photo */}
            <AnimatePresence>
                {activeTheme && activeCat && (
                    <motion.div
                        key={selectedCategory}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 140 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="relative overflow-hidden"
                    >
                        {/* Background Photo */}
                        <img
                            src={activeTheme.photo}
                            alt={activeCat.label}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Color gradient overlay */}
                        <div className={cn("absolute inset-0 bg-gradient-to-r", activeTheme.gradient)} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-4 h-full px-6 sm:px-8">
                            <div className={cn("flex items-center justify-center size-14 rounded-xl backdrop-blur-md border border-white/15", colorMap[activeCat.color]?.bg, colorMap[activeCat.color]?.text)}>
                                <activeCat.icon className="size-7" />
                            </div>
                            <div>
                                <p className="text-white font-semibold font-[family-name:var(--font-outfit)] text-lg">{activeCat.label}</p>
                                <p className="text-white/50 text-sm">Reporting an issue in this category</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {isSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="py-16 px-6 text-center"
                    >
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mb-8 border border-emerald-500/20">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-4">Report Submitted!</h2>
                        <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
                            Your issue has been logged and routed to the right department. You&apos;ll receive updates as it progresses.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button onClick={handleReset} variant="outline" className="rounded-full w-full sm:w-auto">Report Another</Button>
                            <Button asChild className="rounded-full w-full sm:w-auto">
                                <Link href="/dashboard">Track Status</Link>
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 sm:p-8"
                    >
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                {steps.map((step, i) => {
                                    const StepIcon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    return (
                                        <div key={step.id} className="flex items-center gap-3 flex-1">
                                            <div className={cn(
                                                "flex items-center justify-center size-10 rounded-full border-2 transition-all duration-300 shrink-0",
                                                isActive ? "border-primary bg-primary/10 text-primary" :
                                                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                        "border-border/50 text-muted-foreground/50"
                                            )}>
                                                {isCompleted ? (
                                                    <CheckCircle2 className="size-5" />
                                                ) : (
                                                    <StepIcon className="size-5" />
                                                )}
                                            </div>
                                            <div className="hidden sm:block">
                                                <p className={cn(
                                                    "text-xs font-medium transition-colors",
                                                    isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground/50"
                                                )}>
                                                    Step {step.id}
                                                </p>
                                                <p className={cn(
                                                    "text-xs transition-colors",
                                                    isActive ? "text-foreground" : "text-muted-foreground/50"
                                                )}>
                                                    {step.label}
                                                </p>
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div className={cn(
                                                    "flex-1 h-0.5 rounded-full mx-2 transition-colors",
                                                    isCompleted ? "bg-primary" : "bg-border/30"
                                                )} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Category & Location */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] mb-1">Select Category</h2>
                                            <p className="text-sm text-muted-foreground">Choose the type of issue you want to report.</p>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {categories.map((cat) => {
                                                const Icon = cat.icon;
                                                const isSelected = selectedCategory === cat.id;
                                                const colors = colorMap[cat.color];
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => setSelectedCategory(cat.id)}
                                                        className={cn(
                                                            "cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 gap-2",
                                                            isSelected
                                                                ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg`
                                                                : "bg-card/50 border-border/30 hover:border-border/60 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        <Icon className="size-6" />
                                                        <span className="text-xs font-medium text-center leading-tight">{cat.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-base">
                                                Location <span className="text-red-500">*</span>
                                            </Label>

                                            {address ? (
                                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 space-y-2">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center justify-center size-10 rounded-full bg-emerald-500/15 text-emerald-600 shrink-0">
                                                            <MapPin className="size-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-emerald-700 mb-0.5">Location Detected</p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed break-words">{address}</p>
                                                            {coords && (
                                                                <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                                                                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={detectLocation}
                                                        disabled={isLocating}
                                                        className="text-xs text-muted-foreground hover:text-primary w-full"
                                                    >
                                                        {isLocating ? (
                                                            <><Loader2 className="mr-1.5 size-3 animate-spin" /> Re-detecting...</>
                                                        ) : (
                                                            <><MapPin className="mr-1.5 size-3" /> Re-detect Location</>
                                                        )}
                                                    </Button>
                                                </div>

                                            ) : (
                                                <div className="space-y-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={detectLocation}
                                                        disabled={isLocating}
                                                        className="w-full h-14 rounded-xl border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-primary"
                                                    >
                                                        {isLocating ? (
                                                            <><Loader2 className="mr-2 size-5 animate-spin" /> Detecting your location...</>
                                                        ) : (
                                                            <><MapPin className="mr-2 size-5" /> Detect My Location</>
                                                        )}
                                                    </Button>

                                                    <div className="relative">
                                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="w-full text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            if (coords) {
                                                                setShowMapPicker(true);
                                                            } else {
                                                                // Use default (e.g. Jaipur) if no coords yet
                                                                setCoords({ lat: 26.9124, lng: 75.7873 });
                                                                setShowMapPicker(true);
                                                            }
                                                        }}
                                                    >
                                                        Select on Map Manually
                                                    </Button>

                                                    {locationError && (
                                                        <p className="text-xs text-red-500 flex items-center gap-1.5">
                                                            <AlertTriangle className="size-3.5 shrink-0" />
                                                            {locationError}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">Required — we use your location to route the report to the correct local authority.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Location Picker Modal */}
                                <AnimatePresence>
                                    {showMapPicker && coords && (
                                        <LocationPicker
                                            initialLat={coords.lat}
                                            initialLng={coords.lng}
                                            onClose={() => setShowMapPicker(false)}
                                            onSelect={(lat: number, lng: number, addr: string) => {
                                                setCoords({ lat, lng });
                                                setAddress(addr);
                                                setShowMapPicker(false);
                                            }}
                                        />
                                    )}
                                </AnimatePresence>



                                {/* Step 2: Upload Proof */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] mb-1">Upload Evidence</h2>
                                            <p className="text-sm text-muted-foreground">Add photo or video proof to strengthen your report.</p>
                                        </div>

                                        {photoPreview ? (
                                            <div className="relative rounded-xl overflow-hidden border border-border/30 h-72 group bg-card/30">
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-contain" />

                                                {/* AI Overlay using native CSS animation for scanning effect */}
                                                {isAnalyzing && (
                                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
                                                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                                                        <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-primary/20">
                                                            <Loader2 className="size-4 text-primary animate-spin" />
                                                            <span className="text-xs font-medium text-primary">AI Analyzing Image...</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {!isAnalyzing && aiSuggestion && (
                                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                                        <div className="bg-background/90 backdrop-blur-xl p-3 rounded-xl border border-primary/20 shadow-lg flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                                <Brain className="size-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-muted-foreground">AI Detected</p>
                                                                <p className="text-sm font-semibold flex items-center gap-2">
                                                                    {aiSuggestion.category.charAt(0).toUpperCase() + aiSuggestion.category.slice(1)} Issue
                                                                    <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">
                                                                        {aiSuggestion.severity} Severity
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs font-mono text-emerald-500">{(aiSuggestion.confidence * 100).toFixed(0)}%</span>
                                                                <p className="text-[10px] text-muted-foreground">Confidence</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={removePhoto}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors z-20"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-border/30 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                            >
                                                <Upload className="size-10 text-muted-foreground/50 mb-3 group-hover:text-primary group-hover:scale-110 transition-all" />
                                                <p className="text-sm font-medium text-muted-foreground group-hover:text-primary/80">Click to upload photo or video</p>
                                                <p className="text-xs text-muted-foreground/50 mt-1">AI will auto-detect category • Max 5 MB</p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={handlePhotoChange}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Step 3: Details & Submit */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <h2 className="text-xl font-semibold font-[family-name:var(--font-outfit)] mb-1">Describe the Issue</h2>
                                            <p className="text-sm text-muted-foreground">Provide details to help us resolve this faster.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-base">Title</Label>
                                            <Input
                                                id="title"
                                                placeholder="Brief summary of the issue..."
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                className="bg-card/50 border-border/30 h-12 text-lg focus-visible:ring-primary/50"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-base">Description</Label>
                                            <div className="relative">
                                                <Textarea
                                                    id="description"
                                                    placeholder="Describe the location, severity, and any other details..."
                                                    rows={5}
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    className="bg-card/50 border-border/30 resize-none pr-12 text-base focus-visible:ring-primary/50"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVoiceInput}
                                                    className={cn(
                                                        "absolute bottom-3 right-3 p-2 rounded-full transition-all",
                                                        isRecording
                                                            ? "bg-red-500/20 text-red-500 animate-pulse"
                                                            : "bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                    )}
                                                >
                                                    <Mic className="size-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Community Sharing */}
                                        <div className="space-y-3 pt-2">
                                            <h3 className="text-base font-medium flex items-center gap-2">
                                                <Users className="size-4 text-primary" />
                                                Community Sharing
                                            </h3>
                                            <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/30">
                                                <label className="flex items-center justify-between cursor-pointer">
                                                    <div>
                                                        <p className="text-sm font-medium">{t("share_to_feed")}</p>
                                                        <p className="text-xs text-muted-foreground">{t("share_to_feed_desc")}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShareToFeed(!shareToFeed)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors ${shareToFeed ? "bg-primary" : "bg-muted-foreground/30"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${shareToFeed ? "translate-x-5" : "translate-x-0"
                                                                }`}
                                                        />
                                                    </button>
                                                </label>
                                                {shareToFeed && (
                                                    <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-border/20">
                                                        <div className="flex items-center gap-2">
                                                            <EyeOff className="size-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">{t("post_anonymously")}</p>
                                                                <p className="text-xs text-muted-foreground">{t("post_anonymously_desc")}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAnonymous(!isAnonymous)}
                                                            className={`relative w-11 h-6 rounded-full transition-colors ${isAnonymous ? "bg-primary" : "bg-muted-foreground/30"
                                                                }`}
                                                        >
                                                            <span
                                                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${isAnonymous ? "translate-x-5" : "translate-x-0"
                                                                    }`}
                                                            />
                                                        </button>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="size-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-2">
                                {currentStep > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6">
                                        <ArrowLeft className="mr-2 size-4" /> Back
                                    </Button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 ? (
                                    <Button type="button" onClick={nextStep} className="rounded-full px-6 shadow-lg shadow-primary/20">
                                        Next <ArrowRight className="ml-2 size-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 size-5 animate-spin" /> Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 size-5" /> Submit Report
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </motion.div >
                )
                }

            </AnimatePresence >

            {/* Duplicate Warning Modal */}
            <AnimatePresence>
                {
                    showDuplicateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card w-full max-w-sm rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 mb-4">
                                        <AlertTriangle className="size-6 text-amber-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Similar Issue Found!</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        We found {duplicates.length} similar report{duplicates.length > 1 ? "s" : ""} nearby. Upvoting an existing issue is faster than creating a new one.
                                    </p>

                                    <div className="bg-muted/50 rounded-xl p-3 mb-6 text-left">
                                        {duplicates.slice(0, 1).map(d => (
                                            <div key={d.id} className="flex gap-3">
                                                <div className="size-10 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/50">
                                                    <MapPin className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm line-clamp-1">{d.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{d.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {duplicates.length > 1 && (
                                            <p className="text-xs text-center text-muted-foreground mt-2">
                                                + {duplicates.length - 1} more similar issues
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowDuplicateModal(false);
                                                setCurrentStep(2); // Proceed anyway
                                            }}
                                            className="rounded-xl"
                                        >
                                            Report Anyway
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                window.location.href = `/dashboard/1`; // Redirect to duplicate (mock ID 1 for now)
                                            }}
                                            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                                        >
                                            Upvote Existing
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </Card >
    );
}
