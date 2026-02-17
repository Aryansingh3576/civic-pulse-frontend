// components/stat-card.tsx — Animated counter with Intersection Observer
// Follows: UI/UX SKILL (Lucide icons, prefers-reduced-motion), Web Design (tabular-nums)
"use client";

import { useEffect, useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    icon: ReactNode;
    value: number;
    suffix?: string;
    label: string;
    className?: string;
}

export default function StatCard({
    icon,
    value,
    suffix = "",
    label,
    className,
}: StatCardProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        // Check prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) {
            setCount(value);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const duration = 1500;
                    const start = performance.now();

                    function animate(now: number) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease-out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * value));
                        if (progress < 1) requestAnimationFrame(animate);
                    }

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div
            ref={ref}
            className={cn(
                "glass-card p-5 sm:p-6 flex flex-col items-center gap-2 text-center",
                className
            )}
        >
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                {count.toLocaleString()}
                {suffix}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {label}
            </div>
        </div>
    );
}
