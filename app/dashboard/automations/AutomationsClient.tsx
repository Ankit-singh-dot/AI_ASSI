"use client";

import { useState } from "react";
import { Plus, Zap, Clock, MessageSquare, Mail, Calendar, MoreHorizontal, ArrowRight, X } from "lucide-react";
import { toggleAutomation, deleteAutomation, createAutomation } from "@/actions/automations";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, React.ElementType> = {
    MessageSquare,
    Clock,
    Calendar,
    Mail,
    Zap,
};

const templates = [
    { name: "Welcome new leads", description: "Instant acknowledgment for first-time inquiries", category: "Lead Capture", trigger: "New lead added", action: "Send Welcome Message", icon: "MessageSquare", color: "#3b82f6" },
    { name: "Demo follow-up sequence", description: "4-step sequence after demo completion", category: "Follow-up", trigger: "Demo completed", action: "Start Follow-up Sequence", icon: "Calendar", color: "#8b5cf6" },
    { name: "Re-engage lost leads", description: "Monthly re-engagement campaign", category: "Nurture", trigger: "Lead inactive 30 days", action: "Send Re-engagement Email", icon: "Mail", color: "#EA4335" },
];

export default function AutomationsClient({ initialAutomations }: { initialAutomations: any[] }) {
    const [automations, setAutomations] = useState(initialAutomations);
    const [isCreating, setIsCreating] = useState(false);

    const handleToggle = async (id: string) => {
        // Optimistic update
        setAutomations((prev) =>
            prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
        );
        try {
            await toggleAutomation(id);
        } catch (error) {
            // Revert on failure
            setAutomations((prev) =>
                prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
            );
            console.error("Failed to toggle:", error);
        }
    };

    const handleDelete = async (id: string) => {
        setAutomations((prev) => prev.filter((a) => a.id !== id));
        try {
            await deleteAutomation(id);
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const handleUseTemplate = async (template: typeof templates[0]) => {
        setIsCreating(true);
        try {
            const created = await createAutomation({
                name: template.name,
                description: template.description,
                trigger: template.trigger,
                action: template.action,
                icon: template.icon,
                color: template.color,
            });
            setAutomations((prev) => [created, ...prev]);
        } catch (error) {
            console.error("Failed to create from template:", error);
        } finally {
            setIsCreating(false);
        }
    };

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
            </div>

            {/* Active Automations */}
            <div className="space-y-4">
                {automations.length === 0 ? (
                    <div className="glass-card-static p-8 text-center text-sm text-zinc-500">
                        No automations yet. Use a template below to get started.
                    </div>
                ) : automations.map((auto) => {
                    const IconComp = iconMap[auto.icon] || Zap;
                    return (
                        <div
                            key={auto.id}
                            className="glass-card-static p-5 transition-all duration-200"
                            style={{ opacity: auto.active ? 1 : 0.6 }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${auto.color}15` }}
                                    >
                                        <IconComp className="w-5 h-5" style={{ color: auto.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                                            {auto.name}
                                        </h3>
                                        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                                            {auto.description}
                                        </p>
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
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {auto.runs} runs • {auto.successRate}% success
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            Created {formatDistanceToNow(new Date(auto.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleToggle(auto.id)}
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

                                    <button
                                        onClick={() => handleDelete(auto.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Templates */}
            <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    Automation Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map((t) => (
                        <div key={t.name} className="glass-card p-5 cursor-pointer group" onClick={() => handleUseTemplate(t)}>
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
                                {isCreating ? "Adding..." : "Use Template"} <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
