// providers/AuthProvider.tsx — Auth context bridging Clerk + local JWT
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useClerkAuth, useUser as useClerkUser } from "@clerk/nextjs";
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
    syncClerkUser: (email: string, clerkUserId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { signOut: clerkSignOut } = useClerkAuth();

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
            if (err?.response?.status === 403 && err?.response?.data?.data?.requiresClerkVerification) {
                throw { requiresClerkVerification: true, email: err.response.data.data.email, message: err.response.data.message };
            }
            throw err;
        }
    }, [router]);

    const register = useCallback(async (data: { name: string; email: string; phone?: string; password: string }) => {
        const res = await api.post("/users/register", data);
        // Registration doesn't return a token anymore — user needs Clerk verification first
        if (res.data?.data?.requiresClerkVerification) {
            return; // Frontend handles Clerk OTP flow
        }
        // Fallback if somehow a token is returned
        if (res.data?.token) {
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
            setUser(res.data.data?.user);
            router.push("/dashboard");
        }
    }, [router]);

    // Called after successful Clerk OTP verification
    const syncClerkUser = useCallback(async (email: string, clerkUserId: string) => {
        const res = await api.post("/users/clerk-verify", { email, clerkUserId });
        const { token: newToken, data } = res.data;

        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(data.user);
        router.push("/dashboard");
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        // Sign out of Clerk too
        clerkSignOut().catch(() => { });
        router.push("/");
    }, [router, clerkSignOut]);

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
                syncClerkUser,
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
