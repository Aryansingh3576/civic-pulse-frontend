// providers/ThemeProvider.tsx — Following Tailwind SKILL.MD Pattern 6: Dark Mode
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
    children,
    defaultTheme = "dark",
    storageKey = "civicpulse-theme",
}: {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) setTheme(stored);
    }, [storageKey]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");

        const resolved =
            theme === "system"
                ? window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                : theme;

        root.classList.add(resolved);
        setResolvedTheme(resolved);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                "content",
                resolved === "dark" ? "#1a1a2e" : "#ffffff"
            );
        }
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme: (newTheme) => {
                    localStorage.setItem(storageKey, newTheme);
                    setTheme(newTheme);
                },
                resolvedTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
