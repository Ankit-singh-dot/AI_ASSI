"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Top Bar */}
            <div className={`relative z-50 bg-void/50 backdrop-blur-xl border-b border-white/10 transition-colors`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                    <span className="text-void font-bold text-xl leading-none tracking-tighter">AI</span>
                                </div>
                                <span className="text-white font-semibold text-lg tracking-tight">FlowAI</span>
                            </Link>
                        </div>

                        {/* Desktop Menu */}
                        {/* <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link href="#features" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
                                <Link href="#how-it-works" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">How it works</Link>
                                <Link href="#pricing" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
                            </div>
                        </div> */}

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-4 mr-4">
                                <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                                    Log in
                                </Link>
                                <Link href="/dashboard" className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                    Get Started
                                </Link>
                            </div>

                            <button
                                onClick={toggleMenu}
                                className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-white hover:bg-white/10 transition-colors duration-300"
                            >
                                {isMenuOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-void/95 backdrop-blur-lg z-40 pt-20 px-4">
                    <div className="flex flex-col space-y-6 text-center">
                        <Link href="#features" className="text-2xl font-medium text-white hover:text-zinc-300" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="#how-it-works" className="text-2xl font-medium text-white hover:text-zinc-300" onClick={() => setIsMenuOpen(false)}>How it works</Link>
                        <Link href="#pricing" className="text-2xl font-medium text-white hover:text-zinc-300" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link href="/dashboard" className="text-2xl font-medium text-zinc-400 hover:text-white" onClick={() => setIsMenuOpen(false)}>Log in</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
