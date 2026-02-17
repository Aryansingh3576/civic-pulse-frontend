// providers/AuthProvider.tsx — Auth context with JWT token management
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    points: number;
    total_reports?: number;
    badge?: string;
    created_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch profile with existing token
    const fetchProfile = useCallback(async (authToken: string) => {
        try {
            const res = await api.get("/users/profile", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (res.data?.data?.user) {
                setUser(res.data.data.user);
            }
        } catch {
            // Token is invalid — clear it
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        }
    }, []);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
            fetchProfile(savedToken).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [fetchProfile]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await api.post("/users/login", { email, password });
            const { token: newToken, data } = res.data;

            localStorage.setItem("token", newToken);
            setToken(newToken);
            setUser(data.user);
            router.push("/dashboard");
        } catch (err: any) {
            // Handle unverified account — redirect to OTP verification
            if (err?.response?.status === 403 && err?.response?.data?.data?.requiresOTP) {
                throw { requiresOTP: true, email: err.response.data.data.email, message: err.response.data.message };
            }
            throw err;
        }
    }, [router]);

    const register = useCallback(async (data: { name: string; email: string; phone?: string; password: string }) => {
        const res = await api.post("/users/register", data);
        const { token: newToken, data: resData } = res.data;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(resData.user);
        router.push("/dashboard");
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.push("/");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
