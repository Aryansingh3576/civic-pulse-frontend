// app/register/page.tsx — Registration with OTP verification + Hindi support
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Mail, Lock, User, Phone, Shield, KeyRound, RotateCcw } from "lucide-react";
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
import { useLanguage } from "@/providers/LanguageProvider";
import api from "@/lib/api";

export default function RegisterPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const { login: authLogin } = useAuth();

    function startResendTimer() {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError(t("error"));
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await api.post("/users/register", { name, email, phone, password });
            if (res.data?.data?.requiresOTP) {
                setShowOTP(true);
                startResendTimer();
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || t("error");
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleVerifyOTP(e: React.FormEvent) {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await api.post("/users/verify-otp", { email, otp });
            if (res.data?.token) {
                localStorage.setItem("token", res.data.token);
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || t("error");
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResendOTP() {
        if (resendTimer > 0) return;
        setIsLoading(true);
        setError("");

        try {
            await api.post("/users/resend-otp", { email });
            startResendTimer();
        } catch (err: any) {
            setError(err?.response?.data?.message || t("error"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="py-12 sm:py-20" aria-labelledby="register-heading">
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
                            id="register-heading"
                            className="text-2xl sm:text-3xl font-bold mb-1"
                        >
                            {showOTP ? t("verify_email") : t("create_account")}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {showOTP
                                ? `${email} ${t("enter_otp")}`
                                : t("join_civicpulse")}
                        </p>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            {/* ── OTP Verification Step ── */}
                            {showOTP ? (
                                <form onSubmit={handleVerifyOTP} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp-input">{t("otp_label")}</Label>
                                        <div className="relative">
                                            <KeyRound
                                                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                                aria-hidden="true"
                                            />
                                            <Input
                                                id="otp-input"
                                                name="otp"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="123456"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                className="pl-9 text-center text-2xl tracking-[0.5em] font-mono"
                                                autoComplete="one-time-code"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="size-4 mr-2 animate-spin" /> {t("verifying")}</>
                                        ) : (
                                            <><KeyRound className="size-4 mr-2" /> {t("verify_account")}</>
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={resendTimer > 0 || isLoading}
                                            className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline inline-flex items-center gap-1"
                                        >
                                            <RotateCcw className="size-3" />
                                            {resendTimer > 0
                                                ? `${t("resend_otp_in")} ${resendTimer}s`
                                                : t("resend_otp")}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* ── Registration Form ── */
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="register-name">{t("full_name")} *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input id="register-name" name="name" placeholder={t("full_name")} value={name} onChange={(e) => setName(e.target.value)} className="pl-9" autoComplete="name" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-email">{t("email")} *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input id="register-email" name="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-phone">{t("phone_optional")}</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input id="register-phone" name="phone" type="tel" placeholder="+91 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" autoComplete="tel" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-password">{t("password")} *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input id="register-password" name="password" type="password" placeholder="Min 8 characters…" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" autoComplete="new-password" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="register-confirm">{t("confirm_password")} *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                            <Input id="register-confirm" name="confirmPassword" type="password" placeholder={t("confirm_password")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-9" autoComplete="new-password" required />
                                        </div>
                                    </div>

                                    {error && (
                                        <div role="alert" className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <><Loader2 className="size-4 mr-2 animate-spin" /> {t("creating_account")}</>
                                        ) : (
                                            <><UserPlus className="size-4 mr-2" /> {t("create_account")}</>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center pb-6">
                            <p className="text-sm text-muted-foreground">
                                {t("already_have_account")}{" "}
                                <Link href="/login" className="text-primary font-medium cursor-pointer hover:underline">
                                    {t("sign_in")}
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Container>
        </section>
    );
}
