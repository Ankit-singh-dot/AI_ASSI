"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const words = [
    "autopilot.",
    "intelligence.",
    "efficiency.",
    "precision.",
    "scale."
];

export default function Hero() {
    const [index, setIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2500); // Change word every 2.5s
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: "100vh", padding: "140px 20px 80px" }}>

            {/* Animated Grid Layer - Wow Factor */}
            <div className="absolute inset-0 pointer-events-none perspective-[1000px]">
                <motion.div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                        backgroundPosition: "center center",
                    }}
                    animate={{
                        translateY: [0, 80], // animate grid moving down slowly
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "linear"
                    }}
                />

                {/* Center Radial Mask to fade out edges */}
                <div className="absolute inset-0 bg-void" style={{ maskImage: 'radial-gradient(circle at center, transparent 30%, black 80%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 30%, black 80%)' }} />
            </div>

            {/* Glowing Accent Beams */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.5)]" />

            {/* Ambient Backlight */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />

            <div className="container-narrow relative z-10 animate-enter stagger">
                {/* Badge */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl mb-10 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white opacity-90"></span>
                    </span>
                    <span className="text-[11px] font-mono font-medium text-zinc-300 tracking-[0.2em] uppercase">Enterprise Grade AI</span>
                </div>

                {/* Headline with Typewriter / Swap Effect */}
                <h1 className="heading-xl mb-8 leading-[1.1] tracking-tight">
                    Your business runs on <br />
                    <span className="inline-block relative w-[300px] sm:w-[480px] h-[60px] sm:h-[80px] text-left mt-2 align-top overflow-hidden">
                        {isMounted && (
                            <AnimatePresence mode="popLayout">
                                <motion.span
                                    key={words[index]}
                                    initial={{ y: 50, opacity: 0, rotateX: -45 }}
                                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                                    exit={{ y: -50, opacity: 0, rotateX: 45 }}
                                    transition={{
                                        duration: 0.6,
                                        type: "spring",
                                        bounce: 0.2
                                    }}
                                    className="absolute left-0 right-0 mx-auto text-center text-gradient"
                                    style={{ transformOrigin: "50% 50% -20px" }}
                                >
                                    {words[index]}
                                </motion.span>
                            </AnimatePresence>
                        )}
                        {!isMounted && (
                            <span className="absolute left-0 right-0 mx-auto text-center text-gradient">
                                {words[0]}
                            </span>
                        )}
                    </span>
                </h1>

                {/* Subhead */}
                <p className="body-text mx-auto mb-12 text-[1.1rem] text-zinc-400 font-light">
                    Capture leads, qualify prospects, and book meetings.
                    <br className="hidden sm:block" />
                    24/7, without lifting a finger. Built for speed, designed for scale.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
                    <Link href="/signup" className="btn-primary h-14 px-10 text-[15px] shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all">
                        Start Free Trial
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <button className="btn-ghost h-14 px-10 text-[15px] group border-white/10 hover:border-white/20 hover:bg-white/[0.02]">
                        <Play className="w-4 h-4 mr-2 fill-current opacity-60 group-hover:opacity-100 transition-opacity" />
                        See Action
                    </button>
                </div>

                {/* Trust/Stats Bar — Floating minimalist bar */}
                <div
                    className="flex flex-wrap items-center justify-center gap-10 md:gap-24 py-8 px-10 border-t border-white/5 mx-auto w-full max-w-4xl"
                >
                    {[
                        { label: "Active Users", val: "10,000+" },
                        { label: "Leads Processed", val: "2.5M+" },
                        { label: "Uptime SLA", val: "99.9%" }
                    ].map((stat) => (
                        <div key={stat.label} className="text-center group cursor-pointer">
                            <div className="text-2xl font-semibold text-white mb-2 tracking-tight group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">{stat.val}</div>
                            <div className="text-[11px] text-zinc-500 font-mono font-medium uppercase tracking-[0.1em] group-hover:text-zinc-300 transition-colors">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
