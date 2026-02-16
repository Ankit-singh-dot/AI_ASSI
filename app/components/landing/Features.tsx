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
            {/* Ambient */}
            <div
                className="ambient-glow animate-glow-pulse"
                style={{
                    width: "500px",
                    height: "500px",
                    top: "20%",
                    left: "-10%",
                    background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)",
                }}
            />

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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
                    style={{ background: "var(--border)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}
                >
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="p-8 md:p-10 transition-all"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(20px)",
                                transitionDuration: "0.7s",
                                transitionDelay: `${i * 80}ms`,
                                background: "var(--bg-primary)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-primary)")}
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
