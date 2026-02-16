"use client";

import Marquee from "react-fast-marquee";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Priya Mehta",
        role: "Founder, NexGen Solutions",
        text: "FlowAI replaced 3 tools we were paying for. Our response time went from hours to seconds.",
        rating: 5,
    },
    {
        name: "Arjun Kapoor",
        role: "Sales Head, TechBridge",
        text: "We captured 40% more leads in the first month. The AI qualification is scarily accurate.",
        rating: 5,
    },
    {
        name: "Sneha Reddy",
        role: "CEO, GrowthPilot",
        text: "The WhatsApp integration alone saved us 20 hours a week. This is what automation should feel like.",
        rating: 5,
    },
    {
        name: "Vikram Desai",
        role: "Operations, CloudNine",
        text: "Setup took 4 minutes. Not exaggerating. We were live and capturing leads on day one.",
        rating: 5,
    },
    {
        name: "Meera Iyer",
        role: "Director, FutureSoft",
        text: "The sentiment analysis caught a churning customer before we even noticed. Saved a ₹5L deal.",
        rating: 5,
    },
    {
        name: "Rohit Sharma",
        role: "Manager, ScaleUp India",
        text: "Our conversion rate jumped from 12% to 34% in 8 weeks. The follow-up engine is relentless.",
        rating: 5,
    },
    {
        name: "Kavita Nair",
        role: "Founder, BrightPath",
        text: "I was skeptical about AI responses. Then a customer thanked me for the 'personal touch'. It was FlowAI.",
        rating: 5,
    },
    {
        name: "Aditya Singh",
        role: "CTO, DataPulse",
        text: "Enterprise-grade infra without the enterprise price. The uptime has been flawless.",
        rating: 5,
    },
];

const half = Math.ceil(testimonials.length / 2);
const row1 = testimonials.slice(0, half);
const row2 = testimonials.slice(half);

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
    return (
        <div
            className="mx-2 p-6 rounded-2xl flex-shrink-0 transition-all"
            style={{
                width: "340px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Quote */}
            <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: "var(--text-secondary)", minHeight: "48px" }}
            >
                &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{
                        background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(99,102,241,0.15))",
                        color: "var(--text-secondary)",
                    }}
                >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {t.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {t.role}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Testimonials() {
    return (
        <section id="testimonials" className="section relative overflow-hidden">
            {/* Ambient red-indigo blend glow */}
            <div
                className="ambient-glow animate-glow-pulse"
                style={{
                    width: "600px",
                    height: "600px",
                    top: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "radial-gradient(circle, rgba(239,68,68,0.04), rgba(99,102,241,0.03), transparent 70%)",
                }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-16 container-narrow">
                    <p className="caption">Testimonials</p>
                    <h2 className="heading-lg mt-4">
                        Trusted by{" "}
                        <span className="text-gradient">thousands.</span>
                    </h2>
                    <p className="body-text mx-auto mt-4">
                        Teams across India are automating their growth with FlowAI.
                    </p>
                </div>

                {/* Marquee row 1 — left to right */}
                <div className="mb-3">
                    <Marquee speed={30} gradient={false} pauseOnHover>
                        {row1.map((t) => (
                            <TestimonialCard key={t.name} t={t} />
                        ))}
                    </Marquee>
                </div>

                {/* Marquee row 2 — right to left */}
                <div>
                    <Marquee speed={25} gradient={false} pauseOnHover direction="right">
                        {row2.map((t) => (
                            <TestimonialCard key={t.name} t={t} />
                        ))}
                    </Marquee>
                </div>
            </div>
        </section>
    );
}
