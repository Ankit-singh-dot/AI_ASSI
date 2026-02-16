"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative border-t" style={{ borderColor: "var(--border)", background: "var(--bg-primary)", padding: "80px 0 40px" }}>
            <div className="container-wide">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4" style={{ textDecoration: "none" }}>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
                                <Zap className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[14px] font-semibold tracking-tight" style={{ color: "white" }}>FlowAI</span>
                        </Link>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            Intelligent automation for modern sales teams. Built for speed, scale, and silence.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-xs font-semibold mb-4" style={{ color: "var(--text-primary)" }}>PRODUCT</h4>
                        <ul className="space-y-2.5">
                            {["Features", "Integrations", "Pricing", "Changelog"].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-xs font-semibold mb-4" style={{ color: "var(--text-primary)" }}>COMPANY</h4>
                        <ul className="space-y-2.5">
                            {["About", "Customers", "Careers", "Contact"].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h4 className="text-xs font-semibold mb-4" style={{ color: "var(--text-primary)" }}>LEGAL</h4>
                        <ul className="space-y-2.5">
                            {["Privacy Policy", "Terms of Service", "Security", "DPA"].map(item => (
                                <li key={item}>
                                    <Link href="#" className="text-sm transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs" style={{ color: "var(--text-ghost)" }}>
                        © {new Date().getFullYear()} FlowAI Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        {/* No social icons — keep it corporate/infra grade */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
