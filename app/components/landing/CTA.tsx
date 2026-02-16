"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section ref={ref} className="relative overflow-hidden" style={{ padding: "140px 0" }}>
            {/* Animated gradient mesh — red + indigo */}
            <div
                className="absolute inset-0 gradient-mesh-animate transition-opacity"
                style={{
                    opacity: visible ? 1 : 0,
                    transitionDuration: "1.5s",
                    background: "linear-gradient(135deg, rgba(239,68,68,0.04), var(--bg-void), rgba(99,102,241,0.05), var(--bg-void), rgba(239,68,68,0.03))",
                    backgroundSize: "300% 300%",
                }}
            />

            {/* Bloom */}
            <div
                className="ambient-glow animate-glow-pulse"
                style={{
                    width: "500px",
                    height: "500px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(239,68,68,0.05), rgba(99,102,241,0.04), transparent 60%)",
                }}
            />

            <div
                className="container-narrow relative z-10 text-center transition-all"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
                    transitionDuration: "0.8s",
                }}
            >
                <h2 className="heading-lg">
                    Ready to let AI{" "}
                    <span
                        style={{
                            background: "linear-gradient(135deg, #f87171, #818cf8)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        work for you?
                    </span>
                </h2>
                <p className="body-text mx-auto mt-5">
                    Start your 14-day free trial. No credit card. No setup calls.
                </p>
                <div className="mt-10">
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: "linear-gradient(135deg, #ef4444, #6366f1)",
                            color: "white",
                            transitionDuration: "0.3s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 6px 35px rgba(239,68,68,0.25)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        Get started
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
