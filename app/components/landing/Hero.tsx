"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: "100vh", padding: "140px 20px 80px" }}>
            {/* Background Ambience */}
            <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 50% 0%, var(--bg-elevated) 0%, var(--bg-void) 60%)",
                    zIndex: -1
                }}
            />

            {/* Subtle Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }}
            />

            {/* Glow Center */}
            <div
                className="ambient-glow animate-glow-pulse"
                style={{
                    width: "600px",
                    height: "600px",
                    background: "radial-gradient(circle, var(--accent-glow), transparent 70%)",
                    top: "30%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}
            />

            <div className="container-narrow relative z-10 animate-enter stagger">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md mb-8">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-medium text-indigo-300 tracking-wide">AI-POWERED AUTOMATION</span>
                </div>

                {/* Headline */}
                <h1 className="heading-xl mb-6">
                    Your business runs on <br />
                    <span className="text-gradient">autopilot.</span>
                </h1>

                {/* Subhead */}
                <p className="body-text mx-auto mb-10 text-lg">
                    Capture leads, qualify prospects, and book meetings.
                    24/7, without lifting a finger. Built for speed, designed for scale.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link href="/signup" className="btn-primary h-12 px-8 text-[15px]">
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                    <button className="btn-ghost h-12 px-8 text-[15px] group">
                        <Play className="w-4 h-4 mr-2 fill-current opacity-60 group-hover:opacity-100 transition-opacity" />
                        See How It Works
                    </button>
                </div>

                {/* Trust/Stats Bar — Floating pill */}
                <div
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-6 px-10 rounded-2xl glass-card-static mx-auto w-full max-w-3xl"
                    style={{ background: "rgba(14, 14, 20, 0.4)" }}
                >
                    {[
                        { label: "Active Users", val: "10,000+" },
                        { label: "Leads Processed", val: "2.5M+" },
                        { label: "Uptime SLA", val: "99.9%" }
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-xl font-semibold text-white mb-1">{stat.val}</div>
                            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
