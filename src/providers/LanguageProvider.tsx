"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { translations } from "@/lib/translations";

type Lang = "en" | "hi";

interface LanguageContextType {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: "en",
    setLang: () => { },
    t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        if (typeof window !== "undefined") localStorage.setItem("lang", l);
    }, []);

    const t = useCallback(
        (key: string) => translations[lang]?.[key] || translations["en"]?.[key] || key,
        [lang]
    );

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
