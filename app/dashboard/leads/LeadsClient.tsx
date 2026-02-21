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
    X,
    Trash2,
} from "lucide-react";
import { createLead, updateLeadStatus, deleteLead } from "@/actions/leads";
import { formatDistanceToNow } from "date-fns";

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

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
    const [leads, setLeads] = useState(initialLeads);
    const [activeFilter, setActiveFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLead, setNewLead] = useState({ name: "", email: "", phone: "", source: "manual" });
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filters = ["all", "new", "contacted", "qualified", "converted", "lost"];

    const filteredLeads = leads
        .filter((l) => activeFilter === "all" || l.status === activeFilter)
        .filter((l) =>
            searchQuery === "" ||
            l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    const handleCreate = async () => {
        if (!newLead.name.trim()) return;
        setIsCreating(true);
        try {
            const created = await createLead(newLead);
            setLeads((prev) => [created, ...prev]);
            setShowAddModal(false);
            setNewLead({ name: "", email: "", phone: "", source: "manual" });
        } catch (error) {
            console.error("Failed to create lead", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (leadId: string) => {
        try {
            await deleteLead(leadId);
            setLeads((prev) => prev.filter((l) => l.id !== leadId));
        } catch (error) {
            console.error("Failed to delete lead:", error);
        }
    };

    const handleStatusChange = async (leadId: string, status: string) => {
        try {
            const updated = await updateLeadStatus(leadId, status);
            setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...updated } : l)));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Leads
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {leads.length} total leads • {leads.filter((l) => l.status === "new").length} new
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
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
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm outline-none w-full"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>
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
                                {["Lead", "Source", "Status", "Score", "Sentiment", "Last Contact", ""].map((h) => (
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
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-zinc-500">
                                        No leads found. Click "Add Lead" to create your first one.
                                    </td>
                                </tr>
                            ) : filteredLeads.map((lead) => {
                                const SourceIcon = sourceIcon[lead.source] || UserPlus;
                                const sColor = sourceColor[lead.source] || "#8b5cf6";
                                const sConfig = statusConfig[lead.status] || statusConfig.new;
                                return (
                                    <tr
                                        key={lead.id}
                                        className="transition-colors duration-150 cursor-pointer"
                                        style={{ borderBottom: "1px solid var(--border-subtle)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,23,42,0.3)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase"
                                                    style={{ background: "var(--gradient-hero)", color: "white" }}
                                                >
                                                    {lead.name.split(" ").map((n: string) => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {lead.name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                        {lead.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <SourceIcon className="w-4 h-4" style={{ color: sColor }} />
                                                <span className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                                                    {lead.source}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize bg-transparent border-0 outline-none cursor-pointer"
                                                style={{ background: sConfig.bg, color: sConfig.color }}
                                            >
                                                {filters.filter(f => f !== "all").map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                                {lead.score}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm">
                                                {lead.sentiment === "positive" ? "😊" : lead.sentiment === "neutral" ? "😐" : "😞"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                                                {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => handleDelete(lead.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" style={{ color: "var(--text-muted)" }}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">New Lead</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Full Name *"
                                value={newLead.name}
                                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newLead.email}
                                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={newLead.phone}
                                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <select
                                value={newLead.source}
                                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            >
                                <option value="manual">Manual</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="website">Website</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !newLead.name.trim()}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: "var(--accent-blue)",
                                color: "white",
                                opacity: isCreating ? 0.7 : 1,
                            }}
                        >
                            {isCreating ? "Creating..." : "Add Lead"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
