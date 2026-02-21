"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Users,
    LayoutDashboard,
    MessageSquare,
    Settings,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Calendar,
    Zap,
    ChevronsUpDown,
    HelpCircle,
    Sparkles,
    FileText,
} from "lucide-react";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Users, label: "Leads", href: "/dashboard/leads" },
    { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations" },
    { icon: Calendar, label: "Calendar", href: "/dashboard/calendar" },
    { icon: Zap, label: "Automations", href: "/dashboard/automations" },
    { icon: Sparkles, label: "Outreach", href: "/dashboard/outreach" },
    { icon: FileText, label: "Templates", href: "/dashboard/templates" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user, isLoaded } = useUser();

    const displayName = isLoaded && user
        ? `${user.firstName || ""} ${user.lastName ? user.lastName.charAt(0) + "." : ""}`.trim() || "User"
        : "Loading...";
    const initials = isLoaded && user
        ? `${(user.firstName || "U").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase()
        : "..";

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-void)" }}>
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 flex flex-col transition-all relative z-20"
                style={{
                    width: collapsed ? "68px" : "240px",
                    background: "var(--bg-primary)",
                    borderRight: "1px solid var(--border)",
                    transitionDuration: "var(--duration)",
                    transitionTimingFunction: "var(--ease)",
                }}
            >
                {/* Team Switcher Area */}
                <div className="h-16 flex items-center px-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <button
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-shadow group-hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]" style={{ background: "linear-gradient(135deg, var(--accent), #4f46e5)" }}>
                            <div className="w-3.5 h-3.5 bg-white rounded-sm opacity-90" />
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate text-white">FlowAI Inc.</div>
                                <div className="text-[11px] text-zinc-500 truncate">Free Plan</div>
                            </div>
                        )}

                        {!collapsed && (
                            <ChevronsUpDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        )}
                    </button>
                </div>

                {/* Links */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden"
                            >
                                {isActive && (
                                    <div className="absolute inset-0 rounded-lg pointer-events-none" style={{ background: "var(--accent-soft)" }} />
                                )}

                                <item.icon
                                    className="w-4 h-4 flex-shrink-0 relative z-10 transition-colors"
                                    style={{ color: isActive ? "#818cf8" : "var(--text-secondary)" }}
                                    strokeWidth={isActive ? 2 : 1.5}
                                />

                                {!collapsed && (
                                    <span
                                        className="text-[13px] font-medium whitespace-nowrap relative z-10 transition-colors"
                                        style={{ color: isActive ? "white" : "var(--text-secondary)" }}
                                    >
                                        {item.label}
                                    </span>
                                )}

                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-zinc-300"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Topbar */}
                <header
                    className="h-16 flex-shrink-0 flex items-center justify-between px-8 transition-colors backdrop-blur-xl"
                    style={{
                        background: "rgba(8, 8, 12, 0.8)",
                        borderBottom: "1px solid var(--border)"
                    }}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 font-medium">FlowAI</span>
                        <span className="text-zinc-700">/</span>
                        <span className="text-zinc-300 font-medium">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative group hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-3.5 w-3.5 text-zinc-500 group-focus-within:text-zinc-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="block w-64 pl-9 pr-10 py-1.5 text-xs rounded-full border border-white/5 bg-white/[0.03] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <kbd className="hidden sm:inline-block h-4 px-1.5 rounded border border-zinc-700 bg-zinc-800/50 text-[9px] font-sans font-medium text-zinc-500">⌘K</kbd>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-white/10" />

                        <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-zinc-200">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-zinc-900" />
                        </button>

                        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-400 hover:text-zinc-200">
                            <HelpCircle className="w-4 h-4" />
                        </button>

                        {/* Dynamic User Profile */}
                        <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all group ml-1">
                            <div className="text-right hidden sm:block">
                                <div className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors">{displayName}</div>
                                <div className="text-[10px] text-zinc-500">Admin</div>
                            </div>
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                    }
                                }}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 scroll-smooth" style={{ background: "var(--bg-void)" }}>
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
