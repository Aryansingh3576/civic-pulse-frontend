"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronRight,
  Layers,
  MapPinned,
  ArrowUpCircle,
  Camera,
  Copy,
  CheckCircle2,
  Clock,
  Activity,
  Trophy,
  BookOpen,
  Gamepad2,
  BarChart3,
  Map,
  Vote,
  Siren,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/stat-card";
import Footer from "@/components/footer";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <motion.div
          style={{ y, opacity }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary backdrop-blur-md">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              CivicPulse — Now Live
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight font-[family-name:var(--font-outfit)] leading-[1.1]">
              Report civic issues <br />
              <span className="gradient-text">in seconds.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Track resolution transparently. Hold authorities accountable.
            Make your community a better place to live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 rounded-full text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95">
              <Link href="/report">
                Report an Issue <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full text-base bg-background/50 hover:bg-background/80 border-border/50 hover:border-primary/30 backdrop-blur-md transition-all">
              <Link href="/dashboard">Track Complaint</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* ─── Stats Section ─── */}
      <StatsSection />


      {/* ─── Quick Access ─── */}
      <section className="py-16 sm:py-20 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-3">
              Explore <span className="gradient-text">CivicPulse</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Quick access to all the tools you need to engage with your community.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { href: "/leaderboard", label: "Leaderboard", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
              { href: "/civic-education", label: "Civic Education", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
              { href: "/civic-simulator", label: "Civic Simulator", icon: Gamepad2, color: "text-violet-500", bg: "bg-violet-500/10" },
              { href: "/analytics", label: "Analytics", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { href: "/map", label: "Issue Map", icon: Map, color: "text-teal-500", bg: "bg-teal-500/10" },
              { href: "/community-voting", label: "Community Voting", icon: Vote, color: "text-indigo-500", bg: "bg-indigo-500/10" },
              { href: "/sos", label: "SOS Emergency", icon: Siren, color: "text-rose-500", bg: "bg-rose-500/10" },
              { href: "/nearby", label: "Nearby Services", icon: Building2, color: "text-cyan-500", bg: "bg-cyan-500/10" },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={item.href}>
                  <div className="group glass-card p-5 text-center hover:bg-card/40 transition-all cursor-pointer">
                    <div className={`inline-flex p-3 rounded-xl mb-3 ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="size-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-20 sm:py-28 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-3">
              Powerful features for <span className="gradient-text">smarter cities</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Every feature is designed to make issue reporting faster, smarter, and more transparent.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={Layers}
              title="Auto Categorization"
              description="Issues are automatically categorized using AI so they reach the right department instantly."
              delay={0}
            />
            <FeatureCard
              icon={MapPinned}
              title="Red-Zone Heatmap"
              description="Identify high-issue areas with real-time heatmaps. Spot patterns and prioritize hotspots."
              delay={0.1}
            />
            <FeatureCard
              icon={ArrowUpCircle}
              title="Auto Escalation"
              description="Unresolved issues are automatically escalated to higher authorities after the deadline."
              delay={0.2}
            />
            <FeatureCard
              icon={Camera}
              title="Photo Proof Required"
              description="Resolution requires verified photo evidence — ensuring accountability and transparency."
              delay={0.3}
            />
            <FeatureCard
              icon={Copy}
              title="Duplicate Detection"
              description="Similar issues are merged automatically, boosting priority and reducing noise."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-bottom-left scale-110" />
        <div className="container px-4 md:px-6 mx-auto relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 glass-card p-12 md:p-16 border-primary/15 bg-primary/5">
            <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)]">
              Ready to make a difference?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of citizens who are actively shaping their communities.
            </p>
            <Button asChild size="lg" variant="default" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20">
              <Link href="/register">
                Get Started Now <ChevronRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="size-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3 font-[family-name:var(--font-outfit)]">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function StatsSection() {
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const [stats, setStats] = useState({ total_complaints: 0, resolved: 0, active_citizens: 0 });

  useEffect(() => {
    fetch(`${API}/complaints/public-stats`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) setStats(data.data);
      })
      .catch(() => { });
  }, [API]);

  return (
    <section className="py-20 sm:py-28 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-outfit)] mb-3">
            Real impact, <span className="gradient-text">measurable results</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our platform is driving change across communities — here are the numbers.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <StatCard
            icon={<CheckCircle2 className="size-5" />}
            value={stats.total_complaints}
            suffix="+"
            label="Total Reports"
          />
          <StatCard
            icon={<CheckCircle2 className="size-5" />}
            value={stats.resolved}
            suffix=""
            label="Resolved"
          />
          <StatCard
            icon={<Users className="size-5" />}
            value={stats.active_citizens}
            suffix="+"
            label="Active Citizens"
          />
        </div>
      </div>
    </section>
  );
}
