"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Loader2, Mail, Lock, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await api.post("/users/login", { email, password });
            const { token, data } = res.data;
            const user = data.user;

            // Check if user is admin
            if (user.role !== "admin") {
                setError("Access denied. This portal is for administrators only.");
                setIsLoading(false);
                return;
            }

            // Store admin token separately
            localStorage.setItem("admin_token", token);
            localStorage.setItem("admin_user", JSON.stringify(user));

            router.push("/admin/dashboard");
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                "Invalid credentials. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 via-background to-primary/5">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                        <ShieldCheck className="size-8 text-primary" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                        Admin Portal
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Authorized access only. Sign in with your admin credentials.
                    </p>
                </div>

                {/* Card */}
                <Card className="glass-card border-primary/10 shadow-xl shadow-primary/5">
                    <CardContent className="pt-8 pb-8 px-6 sm:px-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="admin-email" className="text-sm font-medium">
                                    Admin Email
                                </Label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        id="admin-email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@civicpulse.gov"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-card/50 border-border/40 focus-visible:ring-primary/50"
                                        autoComplete="email"
                                        spellCheck={false}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="admin-password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        id="admin-password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter admin password…"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 bg-card/50 border-border/40 focus-visible:ring-primary/50"
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    role="alert"
                                    className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3.5"
                                >
                                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl shadow-lg shadow-primary/20 font-semibold text-base"
                                size="lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="size-5 mr-2 animate-spin" />
                                        Authenticating…
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="size-5 mr-2" />
                                        Sign In as Admin
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/40" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground/60">or</span>
                            </div>
                        </div>

                        {/* User login link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Not an administrator?{" "}
                            <Link
                                href="/login"
                                className="text-primary font-medium hover:underline"
                            >
                                Sign in as Citizen
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Security note */}
                <p className="text-center text-xs text-muted-foreground/50 mt-6">
                    🔒 This is a restricted area. All access attempts are logged.
                </p>
            </motion.div>
        </div>
    );
}
