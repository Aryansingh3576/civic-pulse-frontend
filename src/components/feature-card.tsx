// components/feature-card.tsx — Feature highlight card
// Follows: UI/UX SKILL (Lucide icons, hover feedback, cursor-pointer)
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
    className?: string;
}

export default function FeatureCard({
    icon,
    title,
    description,
    className,
}: FeatureCardProps) {
    return (
        <div
            className={cn(
                "glass-card p-6 sm:p-8 group cursor-default transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
                className
            )}
        >
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-5 transition-transform duration-200 group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-wrap-balance">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}
