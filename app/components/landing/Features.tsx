"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Brain, Zap, CalendarCheck, BarChart3, RefreshCw } from "lucide-react";

const features = [
    {
        icon: MessageSquare,
        title: "Multi-channel capture",
        description: "WhatsApp, email, web forms. Every inquiry, one inbox.",
    },
    {
        icon: Brain,
        title: "AI lead scoring",
        description: "Intent analysis and qualification. Instantly, without rules.",
    },
    {
        icon: Zap,
        title: "Auto-responses",
        description: "Context-aware replies in under 3 seconds. Human-quality.",
    },
    {
        icon: CalendarCheck,
        title: "Smart scheduling",
        description: "Meetings booked autonomously. No back-and-forth.",
    },
    {
        icon: BarChart3,
        title: "Sentiment analysis",
        description: "Real-time emotion tracking across every conversation.",
    },
    {
        icon: RefreshCw,
        title: "Follow-up engine",
        description: "Automated sequences that adapt to each lead's behavior.",
    },
];

export default function Features() {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.1 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section id="features" ref={ref} className="section relative">
            {/* Sharp ambient structural line */}
            <div className="absolute left-0 top-1/2 w-1 h-32 bg-white/10 -translate-y-1/2" />

            <div className="container-wide relative z-10">
                {/* Header */}
                <div
                    className="text-center mb-20 transition-all"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transitionDuration: "0.8s",
                    }}
                >
                    <p className="caption">Capabilities</p>
                    <h2 className="heading-lg mt-4">
                        Everything runs.{" "}
                        <span className="text-gradient">Nothing waits.</span>
                    </h2>
                    <p className="body-text mx-auto mt-4">
                        Six core systems working together. No configuration required.
                    </p>
                </div>

                {/* Grid */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10"
                >
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="p-8 md:p-10 transition-all bg-void border-[0.5px] border-transparent hover:border-white/10"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(20px)",
                                transitionDuration: "0.7s",
                                transitionDelay: `${i * 80}ms`,
                            }}
                        >
                            <f.icon
                                className="w-5 h-5 mb-5"
                                style={{ color: "var(--text-muted)" }}
                                strokeWidth={1.5}
                            />
                            <h3
                                className="text-[15px] font-medium mb-2"
                                style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}
                            >
                                {f.title}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                {f.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
