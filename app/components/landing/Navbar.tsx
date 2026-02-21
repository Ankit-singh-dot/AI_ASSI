"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xl leading-none tracking-tighter">AI</span>
                            </div>
                            <span className="text-white font-semibold text-lg tracking-tight">FlowAI</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="#features" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
                            <Link href="#how-it-works" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">How it works</Link>
                            <Link href="#pricing" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                            Log in
                        </Link>
                        <Link href="/dashboard" className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-black/90 border-b border-white/10 backdrop-blur-xl">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/10">Features</Link>
                        <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/10">How it works</Link>
                        <Link href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-white/10">Pricing</Link>
                    </div>
                    <div className="px-4 py-4 border-t border-white/10 space-y-3">
                        <Link href="/dashboard" className="block w-full text-center text-zinc-300 hover:text-white transition-colors font-medium">
                            Log in
                        </Link>
                        <Link href="/dashboard" className="block w-full text-center bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg font-semibold transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
