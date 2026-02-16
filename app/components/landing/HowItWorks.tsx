"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
    {
        number: "01",
        title: "Capture",
        description: "Leads arrive from any channel. Tagged, timestamped, unified in one view.",
        color: "from-blue-500/20 to-blue-600/5",
        border: "border-blue-500/20"
    },
    {
        number: "02",
        title: "Qualify",
        description: "AI scores intent and urgency instantly. No complex rules to configure.",
        color: "from-indigo-500/20 to-indigo-600/5",
        border: "border-indigo-500/20"
    },
    {
        number: "03",
        title: "Respond",
        description: "Context-aware replies sent in seconds. Indistinguishable from human agents.",
        color: "from-purple-500/20 to-purple-600/5",
        border: "border-purple-500/20"
    },
    {
        number: "04",
        title: "Convert",
        description: "Meetings booked, follow-ups triggered, and pipeline moves forward automatically.",
        color: "from-pink-500/20 to-pink-600/5",
        border: "border-pink-500/20"
    },
    {
        number: "05",
        title: "Analyze",
        description: "Real-time dashboards tracking every conversation. Sentiment, conversion rates, and team performance.",
        color: "from-amber-500/20 to-amber-600/5",
        border: "border-amber-500/20"
    },
    {
        number: "06",
        title: "Scale",
        description: "Handle 10 or 10,000 leads. The infrastructure grows with you automatically.",
        color: "from-emerald-500/20 to-emerald-600/5",
        border: "border-emerald-500/20"
    },
];

export default function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(true);

    // Check for mobile to disable heavy scroll effects
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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
            ref={containerRef}
            className="relative"
            style={{ height: isMobile ? "auto" : "500vh" }}
        >
            {/* ——— MOBILE LAYOUT (Vertical) ——— */}
            <div className="md:hidden py-20 px-6">
                <div className="text-center mb-12">
                    <p className="caption">Process</p>
                    <h2 className="heading-lg mt-3">How it works</h2>
                </div>
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className={`p-6 rounded-2xl border bg-gradient-to-br ${step.color} ${step.border} backdrop-blur-sm`}
                        >
                            <div className="text-4xl font-bold text-white/10 mb-4">{step.number}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ——— DESKTOP LAYOUT (Horizontal Scroll) ——— */}
            <div className="hidden md:block sticky top-0 h-screen overflow-hidden">
                {/* Background ambient elements */}
                <div className="absolute inset-0 bg-void pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative h-full flex flex-col justify-center">
                    <div className="container-wide mb-12 px-12">
                        <p className="caption mb-2">Process</p>
                        <h2 className="heading-lg">
                            Automated in <span className="text-gradient">six steps.</span>
                        </h2>
                    </div>

                    {/* Horizontal Track */}
                    <div className="flex items-center w-full relative">
                        {/* Connector Line Background */}
                        <div className="absolute left-[100px] top-1/2 h-[2px] w-[300vw] bg-white/5 -z-10" />

                        {/* Animated Connector Line Payload (fills as you scroll) */}
                        {/* Note: This is tricky with `x` transform on parent. Better to put it *inside* the moving track or handled separately. 
                   If we want it to "fill", it should be relative to viewport.
                   Let's skip the filling line for now as it conflicts with the track movement logic unless complex calculation. 
                   Instead, let's keep the static line but ensure it spans the whole content width.
               */}

                        <motion.div
                            style={{ x }}
                            className="flex items-center gap-20 pl-[100px] pr-[50vw]"
                        >
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className="relative w-[450px] flex-shrink-0 group"
                                >
                                    {/* Number as giant backdrop */}
                                    <span className="absolute -top-20 -left-6 text-[180px] font-bold text-white/[0.02] leading-none select-none transition-colors group-hover:text-white/[0.04]">
                                        {step.number}
                                    </span>

                                    <div className={`relative p-10 rounded-3xl border bg-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] ${step.border} h-[280px] flex flex-col justify-center`}>
                                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10">
                                            <h3 className="text-3xl font-semibold text-white mb-4">{step.title}</h3>
                                            <p className="text-lg text-zinc-400 leading-relaxed max-w-sm">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-12 left-12 flex items-center gap-3 opacity-40">
                        <div className="w-12 h-[1px] bg-white"></div>
                        <span className="text-xs uppercase tracking-widest text-white">Scroll to explore</span>
                    </div>

                    {/* Progress Bar (Bottom) */}
                    <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                        <motion.div style={{ width: lineWidth }} className="h-full bg-indigo-500" />
                    </div>
                </div>
            </div>
        </section>
    );
}
