"use client";

import { Plus, Zap, Clock, MessageSquare, Mail, Calendar, MoreHorizontal, Play, Pause, Trash2, ArrowRight } from "lucide-react";

const automations = [
    {
        id: 1,
        name: "Auto-respond to new WhatsApp leads",
        description: "Send a personalized AI response within 3 seconds of receiving a new WhatsApp message.",
        trigger: "New WhatsApp message",
        action: "AI Auto-response",
        active: true,
        runs: 342,
        successRate: 96,
        lastRun: "2 min ago",
        icon: MessageSquare,
        color: "#25D366",
    },
    {
        id: 2,
        name: "Follow up after 24 hours",
        description: "Automatically send a follow-up message if the lead hasn't responded within 24 hours.",
        trigger: "No response in 24h",
        action: "Send Follow-up",
        active: true,
        runs: 210,
        successRate: 89,
        lastRun: "15 min ago",
        icon: Clock,
        color: "#f59e0b",
    },
    {
        id: 3,
        name: "Book demo with qualified leads",
        description: "When a lead scores above 80, automatically send a calendar booking link.",
        trigger: "Lead score > 80",
        action: "Send Booking Link",
        active: true,
        runs: 87,
        successRate: 73,
        lastRun: "1h ago",
        icon: Calendar,
        color: "#8b5cf6",
    },
    {
        id: 4,
        name: "Email nurture for cold leads",
        description: "Send a weekly email digest with case studies and offers to leads scoring below 50.",
        trigger: "Lead score < 50",
        action: "Email Sequence",
        active: false,
        runs: 156,
        successRate: 42,
        lastRun: "3 days ago",
        icon: Mail,
        color: "#EA4335",
    },
    {
        id: 5,
        name: "Negative sentiment alert",
        description: "Immediately notify the team lead when negative sentiment is detected in a conversation.",
        trigger: "Sentiment = Negative",
        action: "Send Alert",
        active: true,
        runs: 28,
        successRate: 100,
        lastRun: "45 min ago",
        icon: Zap,
        color: "#ef4444",
    },
];

const templates = [
    { name: "Welcome new leads", description: "Instant acknowledgment for first-time inquiries", category: "Lead Capture" },
    { name: "Demo follow-up sequence", description: "4-step sequence after demo completion", category: "Follow-up" },
    { name: "Re-engage lost leads", description: "Monthly re-engagement campaign", category: "Nurture" },
];

export default function AutomationsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Automations</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {automations.filter((a) => a.active).length} active automations running
                    </p>
                </div>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                    <Plus className="w-4 h-4" />
                    Create Automation
                </button>
            </div>

            {/* Active Automations */}
            <div className="space-y-4">
                {automations.map((auto) => (
                    <div
                        key={auto.id}
                        className="glass-card-static p-5 transition-all duration-200"
                        style={{
                            opacity: auto.active ? 1 : 0.6,
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${auto.color}15` }}
                                >
                                    <auto.icon className="w-5 h-5" style={{ color: auto.color }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                                        {auto.name}
                                    </h3>
                                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                                        {auto.description}
                                    </p>
                                    {/* Flow */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                            style={{ background: "rgba(59,130,246,0.08)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.15)" }}
                                        >
                                            {auto.trigger}
                                        </span>
                                        <ArrowRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                                        <span
                                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                                            style={{ background: "rgba(16,185,129,0.08)", color: "var(--accent-green)", border: "1px solid rgba(16,185,129,0.15)" }}
                                        >
                                            {auto.action}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Stats */}
                                <div className="text-right hidden md:block">
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {auto.runs} runs • {auto.successRate}% success
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Last: {auto.lastRun}
                                    </p>
                                </div>

                                {/* Toggle */}
                                <button
                                    className="w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0"
                                    style={{
                                        background: auto.active ? "var(--accent-green)" : "var(--bg-tertiary)",
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300"
                                        style={{ transform: auto.active ? "translateX(22px)" : "translateX(4px)" }}
                                    />
                                </button>

                                <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Templates */}
            <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    Automation Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((t) => (
                        <div key={t.name} className="glass-card p-5 cursor-pointer group">
                            <span
                                className="text-xs px-2 py-0.5 rounded-full mb-3 inline-block"
                                style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)" }}
                            >
                                {t.category}
                            </span>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                                {t.name}
                            </h3>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {t.description}
                            </p>
                            <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--accent-blue)" }}>
                                Use Template <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
