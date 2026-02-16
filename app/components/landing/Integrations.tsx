"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Mail, Calendar, Globe } from "lucide-react";

const channels = [
    { icon: MessageSquare, name: "WhatsApp", description: "Auto-capture via Meta Cloud API. Respond in real-time." },
    { icon: Mail, name: "Email", description: "Parse inquiries, extract intent, auto-respond with context." },
    { icon: Calendar, name: "Calendar", description: "Availability sync, smart booking, automated reminders." },
    { icon: Globe, name: "Web Forms", description: "Embeddable forms. Webhook-ready. Every submission captured." },
];

export default function Integrations() {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <section id="integrations" ref={ref} className="section relative">
            <div className="container-wide relative z-10">
                <div
                    className="text-center mb-20 transition-all"
                    style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? "translateY(0)" : "translateY(20px)",
                        transitionDuration: "0.8s",
                    }}
                >
                    <p className="caption">Integrations</p>
                    <h2 className="heading-lg mt-4">
                        Connects to{" "}
                        <span className="text-gradient">everything.</span>
                    </h2>
                    <p className="body-text mx-auto mt-4">
                        Set up in under 5 minutes. No code required.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {channels.map((ch, i) => (
                        <div
                            key={ch.name}
                            className="surface p-7 transition-all"
                            style={{
                                opacity: visible ? 1 : 0,
                                transform: visible ? "translateY(0)" : "translateY(20px)",
                                transitionDuration: "0.7s",
                                transitionDelay: `${0.1 + i * 0.1}s`,
                            }}
                        >
                            <ch.icon className="w-5 h-5 mb-4" style={{ color: "var(--text-muted)" }} strokeWidth={1.5} />
                            <h3 className="text-[15px] font-medium mb-1.5" style={{ color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                                {ch.name}
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                {ch.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Tech stack */}
                <div
                    className="mt-16 text-center transition-all"
                    style={{
                        opacity: visible ? 1 : 0,
                        transitionDuration: "0.8s",
                        transitionDelay: "0.5s",
                    }}
                >
                    <p className="text-xs mb-4" style={{ color: "var(--text-ghost)" }}>BUILT ON</p>
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                        {["Gemini 2.5 Flash", "NeonDB", "Prisma", "AWS"].map((t) => (
                            <span key={t} className="text-xs font-medium" style={{ color: "var(--text-muted)", letterSpacing: "0.02em" }}>
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
