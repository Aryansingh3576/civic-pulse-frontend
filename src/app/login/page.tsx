// app/login/page.tsx — Login page
// Follows: Tailwind SKILL (shadcn components), Web Design (form labels, autocomplete, focus)
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Loader2, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Container } from "@/components/ui/grid";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Invalid email or password. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="py-16 sm:py-24" aria-labelledby="login-heading">
            <Container size="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-md mx-auto"
                >
                    <div className="text-center mb-8">
                        <Shield
                            className="size-10 text-primary mx-auto mb-4"
                            aria-hidden="true"
                        />
                        <h1
                            id="login-heading"
                            className="text-2xl sm:text-3xl font-bold mb-1"
                        >
                            Welcome Back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to your CivicPulse account
                        </p>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="login-email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                            autoComplete="email"
                                            spellCheck={false}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="login-password"
                                            name="password"
                                            type="password"
                                            placeholder="Enter your password…"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9"
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="text-sm text-destructive bg-destructive/10 rounded-md p-3"
                                    >
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                className="size-4 mr-2 animate-spin"
                                                aria-hidden="true"
                                            />
                                            Signing in…
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="size-4 mr-2" aria-hidden="true" />
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pb-6">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="text-primary font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                >
                                    Create one
                                </Link>
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                Are you an admin?{" "}
                                <Link
                                    href="/admin/login"
                                    className="text-primary/70 font-medium hover:underline"
                                >
                                    Admin Portal →
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Container>
        </section>
    );
}
