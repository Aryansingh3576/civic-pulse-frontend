// components/footer.tsx — Premium CivicPulse Footer
import Link from "next/link";
import {
    Shield,
    Github,
    Twitter,
    Mail,
    Heart,
    MapPin,
    FileText,
    BarChart3,
    Trophy,
    ArrowUpRight,
    Linkedin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
    { href: "/report", label: "Report Issue", icon: FileText },
    { href: "/dashboard", label: "Track Complaint", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: MapPin },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const categories = [
    "Garbage / Waste",
    "Water Supply",
    "Electricity",
    "Road Damage",
    "Street Lights",
    "Public Safety",
    "Drainage / Sewer",
    "Stray Animals",
    "Other",
];

export default function Footer() {
    return (
        <footer
            className="border-t border-border bg-card/50"
            role="contentinfo"
            aria-label="Site footer"
        >
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-lg font-bold cursor-pointer transition-opacity duration-200 hover:opacity-80"
                        >
                            <Shield className="size-6 text-primary" aria-hidden="true" />
                            <span className="gradient-text">CivicPulse</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                            A premium civic issue reporting platform with AI-powered categorization,
                            real-time tracking, and transparent resolution workflows.
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground/60">
                            support@civicpulse.io
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer transition-colors duration-200 hover:text-foreground group"
                                    >
                                        <link.icon
                                            className="size-4 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200"
                                            aria-hidden="true"
                                        />
                                        {link.label}
                                        <ArrowUpRight
                                            className="size-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Categories
                        </h3>
                        <ul className="space-y-2.5">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin
                                            className="size-3 text-muted-foreground/40"
                                            aria-hidden="true"
                                        />
                                        {cat}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social + Connect */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-4">
                            Connect
                        </h3>
                        <div className="flex items-center gap-2">
                            {[
                                {
                                    icon: Github,
                                    label: "GitHub",
                                    href: "https://github.com",
                                },
                                {
                                    icon: Twitter,
                                    label: "Twitter",
                                    href: "https://twitter.com",
                                },
                                {
                                    icon: Linkedin,
                                    label: "LinkedIn",
                                    href: "https://linkedin.com",
                                },
                                { icon: Mail, label: "Email", href: "mailto:support@civicpulse.io" },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target={social.href.startsWith("http") ? "_blank" : undefined}
                                    rel={
                                        social.href.startsWith("http")
                                            ? "noopener noreferrer"
                                            : undefined
                                    }
                                    className="flex items-center justify-center size-10 rounded-lg text-muted-foreground cursor-pointer transition-colors duration-200 hover:text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    aria-label={social.label}
                                >
                                    <social.icon className="size-5" aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} CivicPulse. All rights reserved.
                    </p>
                    <p className="flex items-center gap-1">
                        Made with{" "}
                        <Heart
                            className="size-3 text-destructive"
                            aria-hidden="true"
                        />{" "}
                        for better cities
                    </p>
                </div>
            </div>
        </footer>
    );
}
