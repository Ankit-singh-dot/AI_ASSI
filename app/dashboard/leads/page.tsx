"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    MessageSquare,
    Mail,
    Globe,
    UserPlus,
    ChevronDown,
    Eye,
} from "lucide-react";

const leads = [
    { id: 1, name: "Priya Sharma", email: "priya@sharmaretail.in", phone: "+91 98765 43210", source: "whatsapp", status: "new", score: 92, sentiment: "positive", assigned: "Rahul S.", lastContact: "2 min ago", tags: ["pricing", "urgent"] },
    { id: 2, name: "Vikram Patel", email: "vikram@patelservices.com", phone: "+91 87654 32109", source: "email", status: "contacted", score: 78, sentiment: "neutral", assigned: "Anita K.", lastContact: "8 min ago", tags: ["demo"] },
    { id: 3, name: "Meera Joshi", email: "meera@joshiconsult.in", phone: "+91 76543 21098", source: "website", status: "qualified", score: 85, sentiment: "positive", assigned: "Rahul S.", lastContact: "15 min ago", tags: ["enterprise"] },
    { id: 4, name: "Rajesh Kumar", email: "rajesh@kumaragency.com", phone: "+91 65432 10987", source: "whatsapp", status: "contacted", score: 67, sentiment: "neutral", assigned: "Vikram D.", lastContact: "32 min ago", tags: ["pricing"] },
    { id: 5, name: "Anita Desai", email: "anita@desaitech.in", phone: "+91 54321 09876", source: "email", status: "new", score: 45, sentiment: "neutral", assigned: "Unassigned", lastContact: "1h ago", tags: [] },
    { id: 6, name: "Suresh Nair", email: "suresh@nairfoods.com", phone: "+91 43210 98765", source: "website", status: "qualified", score: 60, sentiment: "negative", assigned: "Anita K.", lastContact: "1.5h ago", tags: ["support"] },
    { id: 7, name: "Deepa Menon", email: "deepa@menondesigns.in", phone: "+91 32109 87654", source: "manual", status: "converted", score: 95, sentiment: "positive", assigned: "Rahul S.", lastContact: "2h ago", tags: ["enterprise", "closed"] },
    { id: 8, name: "Kiran Reddy", email: "kiran@reddyauto.com", phone: "+91 21098 76543", source: "whatsapp", status: "lost", score: 30, sentiment: "negative", assigned: "Vikram D.", lastContact: "3h ago", tags: ["budget"] },
];

const sourceIcon: Record<string, React.ElementType> = {
    whatsapp: MessageSquare,
    email: Mail,
    website: Globe,
    manual: UserPlus,
};

const sourceColor: Record<string, string> = {
    whatsapp: "#25D366",
    email: "#EA4335",
    website: "#06b6d4",
    manual: "#8b5cf6",
};

const statusConfig: Record<string, { bg: string; color: string }> = {
    new: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
    contacted: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    qualified: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6" },
    converted: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
    lost: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

export default function LeadsPage() {
    const [activeFilter, setActiveFilter] = useState("all");

    const filters = ["all", "new", "contacted", "qualified", "converted", "lost"];

    const filteredLeads = activeFilter === "all" ? leads : leads.filter((l) => l.status === activeFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Leads
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {leads.length} total leads • {leads.filter((l) => l.status === "new").length} new today
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                        <Plus className="w-4 h-4" />
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 whitespace-nowrap"
                            style={{
                                background: activeFilter === f ? "rgba(59,130,246,0.12)" : "transparent",
                                color: activeFilter === f ? "var(--accent-blue)" : "var(--text-muted)",
                                border: `1px solid ${activeFilter === f ? "rgba(59,130,246,0.3)" : "var(--border-subtle)"}`,
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 sm:flex-initial sm:min-w-[240px]"
                        style={{
                            background: "rgba(15,23,42,0.5)",
                            border: "1px solid var(--border-subtle)",
                        }}
                    >
                        <Search className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            className="bg-transparent text-sm outline-none w-full"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>
                    <button
                        className="p-2 rounded-xl"
                        style={{ border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div
                className="glass-card-static overflow-hidden"
                style={{ background: "var(--bg-secondary)" }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                {["Lead", "Source", "Status", "Score", "Sentiment", "Assigned", "Last Contact", ""].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {h}
                                            {h && <ChevronDown className="w-3 h-3 opacity-50" />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => {
                                const SourceIcon = sourceIcon[lead.source];
                                const sColor = sourceColor[lead.source];
                                const sConfig = statusConfig[lead.status];
                                return (
                                    <tr
                                        key={lead.id}
                                        className="transition-colors duration-150 cursor-pointer"
                                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,23,42,0.3)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        {/* Lead */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: "var(--gradient-hero)", color: "white" }}
                                                >
                                                    {lead.name.split(" ").map((n) => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {lead.name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                        {lead.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Source */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <SourceIcon className="w-4 h-4" style={{ color: sColor }} />
                                                <span className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                                                    {lead.source}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <span
                                                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                                                style={{ background: sConfig.bg, color: sConfig.color }}
                                            >
                                                {lead.status}
                                            </span>
                                        </td>
                                        {/* Score */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="status-dot"
                                                    style={{
                                                        background:
                                                            lead.score >= 80
                                                                ? "var(--accent-red)"
                                                                : lead.score >= 50
                                                                    ? "var(--accent-yellow)"
                                                                    : "var(--accent-blue)",
                                                        boxShadow:
                                                            lead.score >= 80
                                                                ? "0 0 8px rgba(239,68,68,0.5)"
                                                                : lead.score >= 50
                                                                    ? "0 0 8px rgba(245,158,11,0.5)"
                                                                    : "0 0 8px rgba(59,130,246,0.5)",
                                                    }}
                                                />
                                                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                                    {lead.score}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Sentiment */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm">
                                                {lead.sentiment === "positive" ? "😊" : lead.sentiment === "neutral" ? "😐" : "😞"}
                                            </span>
                                        </td>
                                        {/* Assigned */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                {lead.assigned}
                                            </span>
                                        </td>
                                        {/* Last Contact */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                                                {lead.lastContact}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
