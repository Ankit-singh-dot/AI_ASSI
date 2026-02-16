"use client";

import { useEffect, useRef, useState } from "react";

export default function GradientBand() {
    const ref = useRef<HTMLDivElement>(null);
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
        <div
            ref={ref}
            className="relative overflow-hidden"
            style={{ padding: "100px 0" }}
        >
            {/* Animated gradient mesh — red + indigo + dark */}
            <div
                className="absolute inset-0 transition-opacity gradient-mesh-animate"
                style={{
                    opacity: visible ? 1 : 0,
                    transitionDuration: "1.5s",
                    background: "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(99,102,241,0.08), rgba(5,5,8,1), rgba(239,68,68,0.04), rgba(99,102,241,0.06))",
                    backgroundSize: "300% 300%",
                }}
            />

            {/* Rotating blur orbs */}
            <div
                className="absolute"
                style={{
                    width: "300px",
                    height: "300px",
                    top: "50%",
                    left: "30%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    background: "rgba(239,68,68,0.08)",
                    animation: visible ? "meshRotate 20s linear infinite" : "none",
                }}
            />
            <div
                className="absolute"
                style={{
                    width: "250px",
                    height: "250px",
                    top: "50%",
                    right: "20%",
                    transform: "translateY(-50%)",
                    borderRadius: "50%",
                    filter: "blur(80px)",
                    background: "rgba(99,102,241,0.08)",
                    animation: visible ? "meshRotate 25s linear infinite reverse" : "none",
                }}
            />

            {/* Content */}
            <div
                className="container-narrow relative z-10 text-center transition-all"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transitionDuration: "0.8s",
                    transitionDelay: "0.3s",
                }}
            >
                <p
                    className="text-4xl md:text-5xl font-semibold leading-tight"
                    style={{
                        letterSpacing: "-0.03em",
                        background: "linear-gradient(135deg, #f87171, #818cf8, #f87171)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        animation: "gradientShift 6s ease-in-out infinite",
                    }}
                >
                    Automate everything.
                    <br />
                    Regret nothing.
                </p>
                <p className="body-text mx-auto mt-6" style={{ maxWidth: "380px" }}>
                    While you sleep, FlowAI captures, qualifies, responds, and closes.
                </p>
            </div>
        </div>
    );
}
