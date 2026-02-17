"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface SlaTimerProps {
    deadline: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function SlaTimer({ deadline, className, size = "md" }: SlaTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(deadline).getTime();
            const difference = target - now;

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds, isExpired: false });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    if (!timeLeft) return null;

    const isCritical = !timeLeft.isExpired && timeLeft.hours < 4;
    const isWarning = !timeLeft.isExpired && timeLeft.hours < 24;

    const sizeClasses = {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-3 py-1.5",
        lg: "text-base px-4 py-2"
    };

    return (
        <div className={cn(
            "rounded-full font-mono font-medium flex items-center gap-2 border shadow-sm",
            timeLeft.isExpired
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : isCritical
                    ? "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse"
                    : isWarning
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
            sizeClasses[size],
            className
        )}>
            {timeLeft.isExpired ? (
                <>
                    <AlertTriangle className="size-4" />
                    <span>Sla Breached</span>
                </>
            ) : (
                <>
                    <Clock className="size-4" />
                    <span>
                        {String(timeLeft.hours).padStart(2, '0')}:
                        {String(timeLeft.minutes).padStart(2, '0')}:
                        {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                </>
            )}
        </div>
    );
}
