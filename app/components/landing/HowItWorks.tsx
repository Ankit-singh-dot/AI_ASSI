"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Capture",
        description: "Leads arrive from any channel. Tagged, timestamped, unified in one view.",
    },
    {
        number: "02",
        title: "Qualify",
        description: "AI scores intent and urgency instantly. No complex rules to configure.",
    },
    {
        number: "03",
        title: "Respond",
        description: "Context-aware replies sent in seconds. Indistinguishable from human agents.",
    },
    {
        number: "04",
        title: "Convert",
        description: "Meetings booked, follow-ups triggered, and pipeline moves forward automatically.",
    },
    {
        number: "05",
        title: "Analyze",
        description: "Real-time dashboards tracking every conversation. Sentiment, conversion rates, and team performance.",
    },
    {
        number: "06",
        title: "Scale",
        description: "Handle 10 or 10,000 leads. The infrastructure grows with you automatically.",
    },
];

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Transform scroll progress to horizontal movement
    // Moves from 0% to -85% (showing 6 items)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);
    // Progress line width
    const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section
            id="how-it-works"
            className="relative"
        >
            {/* ——— MOBILE LAYOUT (Vertical) ——— */}
            {/* Visible only on mobile screens */}
            <div className="md:hidden py-20 px-6">
                <div className="text-center mb-12">
                    <p className="caption">Process</p>
                    <h2 className="heading-lg mt-3">How it works</h2>
                </div>
                <div className="space-y-4 relative border-l border-white/10 ml-4 pl-8">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className="relative py-4"
                        >
                            <div className="absolute -left-[45px] top-5 w-6 h-6 rounded-full bg-void border-[4px] border-white/20 flex items-center justify-center z-10" />
                            <div className="text-xs font-mono text-zinc-500 mb-1">STEP {step.number}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ——— DESKTOP LAYOUT (Horizontal Scroll) ——— */}
            {/* Height forces the scrolling duration. Using a wrapper hidden on mobile to prevent massive height sprawl. */}
            <div className="hidden md:block w-full h-[500vh]" ref={containerRef}>
                <div className="sticky top-0 h-screen overflow-hidden bg-void">
                    <div className="absolute inset-0 bg-void pointer-events-none" />

                    <div className="relative h-full flex flex-col justify-center">
                        <div className="container-wide mb-12 px-12">
                            <p className="caption mb-2">Process</p>
                            <h2 className="heading-lg">
                                Flow <span className="text-gradient">architecture.</span>
                            </h2>
                        </div>

                        {/* Horizontal Track */}
                        <div className="flex items-center w-full relative">
                            {/* Connector Line Background */}
                            <div className="absolute left-[100px] top-1/2 h-[1px] w-[300vw] bg-white/10 -z-10" />

                            <motion.div
                                style={{ x }}
                                className="flex items-center gap-12 pl-[100px] pr-[50vw]"
                            >
                                {steps.map((step, idx) => (
                                    <div
                                        key={step.number}
                                        className="relative w-[400px] flex-shrink-0 group"
                                    >
                                        <div className={`relative p-8 border-l border-white/10 bg-void h-[260px] flex flex-col justify-between transition-all duration-300 hover:bg-white/[0.02]`}>
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-mono text-zinc-500">/{step.number}</div>
                                                <div className="w-1.5 h-1.5 bg-white/20 rounded-full group-hover:bg-white/80 transition-colors" />
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-semibold text-white mb-3">{step.title}</h3>
                                                <p className="text-[15px] text-zinc-400 leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Scroll Indicator */}
                        <div className="absolute bottom-12 left-12 flex items-center gap-4 opacity-30">
                            <div className="w-8 h-[1px] bg-white"></div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-white">Scroll to trace</span>
                        </div>

                        {/* Progress Bar (Bottom) */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full">
                            <motion.div style={{ width: lineWidth }} className="h-full bg-white/40" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
