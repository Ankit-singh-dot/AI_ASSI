"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
    {
        name: "Starter",
        price: "₹999",
        description: "For solo operators getting started.",
        features: [
            "1 channel (WhatsApp or Email)",
            "Up to 200 leads/month",
            "AI auto-responses",
            "Basic lead scoring",
            "Email support",
        ],
        cta: "Start free trial",
        highlighted: false,
    },
    {
        name: "Professional",
        price: "₹2,499",
        description: "For growing teams. Full automation.",
        features: [
            "All channels",
            "Up to 2,000 leads/month",
            "Advanced AI with Hinglish",
            "Smart lead routing",
            "Appointment booking",
            "Sentiment analysis",
            "Priority support",
        ],
        cta: "Start free trial",
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        description: "For organizations needing control.",
        features: [
            "Unlimited channels & leads",
            "Custom AI model training",
            "Dedicated account manager",
            "SSO & advanced RBAC",
            "Custom integrations",
            "SLA guarantee",
        ],
        cta: "Contact sales",
        highlighted: false,
    },
];

export default function Pricing() {
    const sectionRef = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section id="pricing" ref={sectionRef} className="relative overflow-hidden" style={{ padding: "140px 0" }}>
            {/* ✦ RED AMBIENT GLOW — large, fading, dramatic */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity"
                style={{
                    opacity: visible ? 1 : 0,
                    transitionDuration: "1.5s",
                    transitionTimingFunction: "ease-out",
                }}
            >
                {/* Main red bloom */}
                <div
                    className="absolute animate-glow-pulse"
                    style={{
                        width: "100%",
                        height: "800px",
                        top: "-10%",
                        left: "0",
                        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(239,68,68,0.08), rgba(239,68,68,0.03) 40%, transparent 70%)",
                    }}
                />
                {/* Side bleed — left */}
                <div
                    className="absolute"
                    style={{
                        width: "500px",
                        height: "500px",
                        top: "30%",
                        left: "-5%",
                        borderRadius: "50%",
                        filter: "blur(100px)",
                        background: "rgba(239,68,68,0.05)",
                    }}
                />
                {/* Side bleed — right indigo */}
                <div
                    className="absolute"
                    style={{
                        width: "400px",
                        height: "400px",
                        top: "20%",
                        right: "-5%",
                        borderRadius: "50%",
                        filter: "blur(100px)",
                        background: "rgba(99,102,241,0.04)",
                    }}
                />
            </div>

            {/* Fade-out at bottom */}
            <div
                className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }}
            />

            <div className="container-wide relative z-10">
                <div className="text-center mb-20">
                    <p className="caption" style={{ color: "rgba(239,68,68,0.6)" }}>Pricing</p>
                    <h2
                        className="heading-lg mt-4 transition-all"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(20px)",
                            transitionDuration: "0.8s",
                            transitionDelay: "0.1s",
                        }}
                    >
                        Simple.{" "}
                        <span
                            style={{
                                background: "linear-gradient(135deg, #ef4444, #6366f1)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Transparent.
                        </span>
                    </h2>
                    <p
                        className="body-text mx-auto mt-4 transition-all"
                        style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? "translateY(0)" : "translateY(15px)",
                            transitionDuration: "0.8s",
                            transitionDelay: "0.2s",
                        }}
                    >
                        14-day free trial. No credit card required.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {tiers.map((tier, i) => (
                        <div
                            key={tier.name}
                            className="p-7 rounded-2xl transition-all"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(30px)",
                                transitionDuration: "0.8s",
                                transitionDelay: `${0.15 + i * 0.1}s`,
                                background: tier.highlighted
                                    ? "rgba(255,255,255,0.03)"
                                    : "rgba(255,255,255,0.015)",
                                border: tier.highlighted
                                    ? "1px solid rgba(239,68,68,0.2)"
                                    : "1px solid var(--border)",
                                boxShadow: tier.highlighted
                                    ? "0 0 80px rgba(239,68,68,0.06), inset 0 1px 0 rgba(255,255,255,0.03)"
                                    : "none",
                            }}
                        >
                            <div className="mb-6">
                                {tier.highlighted && (
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium mb-3"
                                        style={{
                                            background: "rgba(239,68,68,0.1)",
                                            color: "#f87171",
                                            border: "1px solid rgba(239,68,68,0.15)",
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ef4444" }} />
                                        Most Popular
                                    </span>
                                )}
                                <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>
                                    {tier.name}
                                </h3>
                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                    {tier.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <span
                                    className="text-3xl font-semibold"
                                    style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
                                >
                                    {tier.price}
                                </span>
                                {tier.price !== "Custom" && (
                                    <span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>/month</span>
                                )}
                            </div>

                            <Link
                                href={tier.name === "Enterprise" ? "#" : "/signup"}
                                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-[13px] font-medium transition-all mb-6"
                                style={{
                                    background: tier.highlighted
                                        ? "linear-gradient(135deg, #ef4444, #6366f1)"
                                        : "transparent",
                                    border: tier.highlighted ? "none" : "1px solid var(--border)",
                                    color: tier.highlighted ? "white" : "var(--text-secondary)",
                                    transitionDuration: "0.3s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!tier.highlighted) {
                                        e.currentTarget.style.borderColor = "var(--border-hover)";
                                        e.currentTarget.style.background = "var(--bg-glass)";
                                    } else {
                                        e.currentTarget.style.boxShadow = "0 4px 25px rgba(239,68,68,0.3)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!tier.highlighted) {
                                        e.currentTarget.style.borderColor = "var(--border)";
                                        e.currentTarget.style.background = "transparent";
                                    } else {
                                        e.currentTarget.style.boxShadow = "none";
                                    }
                                }}
                            >
                                {tier.cta}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>

                            <ul className="space-y-2.5">
                                {tier.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5">
                                        <Check
                                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                                            style={{ color: tier.highlighted ? "#f87171" : "var(--text-muted)" }}
                                            strokeWidth={2}
                                        />
                                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
