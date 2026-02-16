"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center" style={{ padding: "16px 20px" }}>
            <div
                className="flex items-center justify-between w-full transition-all"
                style={{
                    maxWidth: scrolled ? "780px" : "1120px",
                    padding: "10px 20px",
                    borderRadius: scrolled ? "100px" : "16px",
                    background: scrolled
                        ? "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(79,70,229,0.92))"
                        : "rgba(99,102,241,0.08)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: scrolled
                        ? "1px solid rgba(255,255,255,0.15)"
                        : "1px solid rgba(99,102,241,0.15)",
                    boxShadow: scrolled
                        ? "0 8px 40px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"
                        : "none",
                    transitionDuration: "0.5s",
                    transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: scrolled ? "rgba(255,255,255,0.2)" : "var(--accent)",
                        }}
                    >
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span
                        className="text-[14px] font-semibold tracking-tight"
                        style={{ color: "white" }}
                    >
                        FlowAI
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-all"
                            style={{
                                color: scrolled ? "rgba(255,255,255,0.75)" : "var(--text-muted)",
                                transitionDuration: "0.3s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "white";
                                e.currentTarget.style.background = scrolled
                                    ? "rgba(255,255,255,0.12)"
                                    : "rgba(99,102,241,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = scrolled ? "rgba(255,255,255,0.75)" : "var(--text-muted)";
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-2">
                    <Link
                        href="/login"
                        className="text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors"
                        style={{
                            color: scrolled ? "rgba(255,255,255,0.75)" : "var(--text-muted)",
                            transitionDuration: "0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? "rgba(255,255,255,0.75)" : "var(--text-muted)")}
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/signup"
                        className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-all"
                        style={{
                            background: scrolled ? "rgba(0,0,0,0.35)" : "var(--accent)",
                            color: "white",
                            transitionDuration: "0.3s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = scrolled ? "rgba(0,0,0,0.5)" : "#4f46e5";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = scrolled ? "rgba(0,0,0,0.35)" : "var(--accent)";
                        }}
                    >
                        Try for Free
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-1.5 rounded-full"
                    style={{ color: "white", background: "rgba(255,255,255,0.1)" }}
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div
                    className="absolute top-full left-4 right-4 mt-2 p-4 rounded-2xl md:hidden"
                    style={{
                        background: "rgba(14, 14, 20, 0.95)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--border)",
                    }}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="block py-3 text-sm"
                            style={{ color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="flex gap-3 mt-4">
                        <Link href="/login" className="btn-ghost flex-1 justify-center" style={{ padding: "8px", fontSize: "13px" }}>
                            Sign in
                        </Link>
                        <Link href="/signup" className="btn-primary flex-1 justify-center" style={{ padding: "8px", fontSize: "13px" }}>
                            Try for Free
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
