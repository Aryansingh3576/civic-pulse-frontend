"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    User,
    Users,
    ShieldAlert,
    LayoutDashboard,
    Trophy,
    Shield,
    ChevronDown,
    BookOpen,
    Brain,
    MapPin,
    BarChart3,
    ArrowUp,
    Siren,
    Building,
    Compass,
    Grid3X3,
    Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider"; // Added
import NotificationCenter from "@/components/notification-center"; // Added
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/community", label: "Community", icon: Users },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/dashboard", label: "Track", icon: LayoutDashboard },
    { href: "/report", label: "Report", icon: ShieldAlert },
];

const exploreLinks = [
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/civic-education", label: "Civic Education", icon: BookOpen },
    { href: "/civic-simulator", label: "Civic Simulator", icon: Brain },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/map", label: "Issue Map", icon: MapPin },
    { href: "/community-voting", label: "Community Voting", icon: ArrowUp },
    { href: "/sos", label: "SOS Emergency", icon: Siren },
    { href: "/nearby-services", label: "Nearby Services", icon: Building },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { user, logout, isLoading } = useAuth();
    const { t, lang, setLang } = useLanguage(); // Added
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => setIsOpen(false), [pathname]);

    const searchSuggestions = [
        "Road damage on Main Street",
        "Water leakage near Park Avenue",
        "Street light not working",
        "Garbage collection delay",
        "Pothole complaint status",
    ].filter(s => searchQuery && s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!mounted) return null;

    // Hide navbar on admin routes
    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            <header
                className={cn(
                    "fixed top-4 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-8",
                    scrolled ? "py-0" : "py-2"
                )}
            >
                <div className={cn(
                    "mx-auto max-w-6xl transition-all duration-300 rounded-2xl border",
                    scrolled
                        ? "bg-background/70 backdrop-blur-xl border-border/50 shadow-lg py-3 px-6"
                        : "bg-transparent border-transparent py-4 px-0"
                )}>
                    <div className="flex h-10 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative flex items-center justify-center size-9 rounded-xl bg-primary/15 group-hover:bg-primary/25 transition-colors">
                                <Shield className="size-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
                                Civic<span className="text-primary">Pulse</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "relative px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:text-foreground/80 whitespace-nowrap",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {t(link.label.toLowerCase().replace(" ", "_"))}
                                    </Link>
                                );
                            })}
                            {/* Explore Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={cn(
                                        "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:text-foreground/80",
                                        exploreLinks.some(l => pathname === l.href) ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        <Compass className="size-4" />
                                        {t("explore")}
                                        <ChevronDown className="size-3.5 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 glass-card p-3">
                                    <div className="grid grid-cols-2 gap-1">
                                        {exploreLinks.map((link) => (
                                            <DropdownMenuItem key={link.href} asChild className="rounded-lg">
                                                <Link href={link.href} className="w-full cursor-pointer flex items-center gap-2 px-3 py-2.5">
                                                    <link.icon className="size-4 text-primary/70" />
                                                    <span className="text-sm">{t(link.label.toLowerCase().replace(" ", "_"))}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </nav>

                        {/* Right Side: Search, Theme & Auth */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Language Toggle */}
                            <button
                                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-xs font-bold"
                                title="Switch Language"
                            >
                                {lang === "en" ? "🇮🇳 HI" : "🇬🇧 EN"}
                            </button>

                            {/* Notification Center */}
                            <NotificationCenter />

                            {/* Search Toggle */}
                            <div className="relative">
                                <button
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                    aria-label="Search"
                                >
                                    <Search className="size-5" />
                                </button>
                                <AnimatePresence>
                                    {searchOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 260 }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="absolute right-0 top-full mt-2 overflow-hidden"
                                        >
                                            <div className="glass-card p-2">
                                                <input
                                                    type="text"
                                                    placeholder={t("search") + "..."}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-transparent text-sm px-3 py-2 outline-none placeholder:text-muted-foreground/50"
                                                    autoFocus
                                                />
                                                {searchSuggestions.length > 0 && (
                                                    <div className="border-t border-border/30 mt-1 pt-1">
                                                        {searchSuggestions.map((s, i) => (
                                                            <button key={i} className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>



                            {/* Auth State */}
                            {!isLoading && (
                                user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="pl-2 pr-1 gap-2 rounded-full ring-offset-2 ring-primary">
                                                <Avatar className="size-8 border border-border">
                                                    <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                                                <ChevronDown className="size-4 text-muted-foreground opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 glass-card p-2">
                                            <DropdownMenuItem asChild className="rounded-md">
                                                <Link href="/profile" className="w-full cursor-pointer">
                                                    <User className="mr-2 size-4" />
                                                    <span>{t("profile")}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem
                                                onClick={logout}
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-md"
                                            >
                                                <LogOut className="mr-2 size-4" />
                                                <span>{t("logout")}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                            {t("login")}
                                        </Link>
                                        <Button asChild size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                            <Link href="/register">{t("register")}</Link>
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-[72px] z-40 bg-background/95 backdrop-blur-3xl md:hidden flex flex-col p-6 gap-6"
                    >
                        <nav className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl text-lg font-medium transition-colors",
                                        pathname === link.href
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.icon && <link.icon className="size-5" />}
                                    {t(link.label.toLowerCase().replace(" ", "_"))}
                                </Link>
                            ))}
                            <div className="border-t border-border/20 pt-2 mt-1">
                                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider px-4 mb-1">{t("explore")}</p>
                                {exploreLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl text-base font-medium transition-colors",
                                            pathname === link.href
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <link.icon className="size-4" />
                                        {t(link.label.toLowerCase().replace(" ", "_"))}
                                    </Link>
                                ))}
                            </div>
                        </nav>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/50 text-base font-medium"
                            >
                                {lang === "en" ? "🇮🇳 Switch to Hindi" : "🇬🇧 Switch to English"}
                            </button>

                            {!isLoading && user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-start"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        {t("logout")}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/login">{t("login")}</Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/register">{t("register")}</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
