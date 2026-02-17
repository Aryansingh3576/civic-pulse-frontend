// components/ui/tabs.tsx — Tab navigation component
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
    value: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export function Tabs({ tabs, defaultValue, onValueChange, className }: TabsProps) {
    const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? "");

    function handleChange(value: string) {
        setActive(value);
        onValueChange?.(value);
    }

    return (
        <div
            role="tablist"
            aria-label="Filter tabs"
            className={cn(
                "inline-flex items-center gap-1 rounded-lg bg-muted p-1",
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    role="tab"
                    aria-selected={active === tab.value}
                    onClick={() => handleChange(tab.value)}
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        active === tab.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                        <span
                            className={cn(
                                "tabular-nums rounded-full px-1.5 py-0.5 text-xs",
                                active === tab.value
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted-foreground/10 text-muted-foreground"
                            )}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

// Active tab value getter
export function useTabState(defaultValue: string) {
    const [value, setValue] = useState(defaultValue);
    return { value, onValueChange: setValue };
}
