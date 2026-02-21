"use client";

import { useState } from "react";
import { Plus, MessageSquare, Copy, Trash2, X, Check, BarChart3 } from "lucide-react";
import { createQuickReply, deleteQuickReply, useQuickReply } from "@/actions/quick-replies";

const categoryColors: Record<string, string> = {
    greeting: "#10b981",
    pricing: "#f59e0b",
    "follow-up": "#3b82f6",
    closing: "#8b5cf6",
    general: "#64748b",
};

export default function TemplatesClient({ initialReplies }: { initialReplies: any[] }) {
    const [replies, setReplies] = useState(initialReplies);
    const [showAdd, setShowAdd] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [newReply, setNewReply] = useState({ title: "", body: "", category: "general" });

    const handleCreate = async () => {
        if (!newReply.title.trim() || !newReply.body.trim()) return;
        setIsCreating(true);
        try {
            const created = await createQuickReply(newReply);
            setReplies((prev) => [created, ...prev]);
            setShowAdd(false);
            setNewReply({ title: "", body: "", category: "general" });
        } catch (error) {
            console.error("Failed to create:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        setReplies((prev) => prev.filter((r) => r.id !== id));
        try { await deleteQuickReply(id); } catch { }
    };

    const handleCopy = async (reply: any) => {
        navigator.clipboard.writeText(reply.body);
        setCopiedId(reply.id);
        setTimeout(() => setCopiedId(null), 2000);
        try { await useQuickReply(reply.id); } catch { }
        setReplies((prev) => prev.map((r) => r.id === reply.id ? { ...r, usageCount: r.usageCount + 1 } : r));
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Quick Replies</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        {replies.length} templates • Copy to clipboard instantly
                    </p>
                </div>
                <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                    <Plus className="w-4 h-4" /> New Template
                </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {replies.map((reply) => (
                    <div key={reply.id} className="glass-card-static p-5 group flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                                    style={{ background: `${categoryColors[reply.category] || "#64748b"}15`, color: categoryColors[reply.category] || "#64748b" }}
                                >
                                    {reply.category}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(reply.id)}
                                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                            {reply.title}
                        </h3>
                        <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "var(--text-muted)" }}>
                            {reply.body}
                        </p>
                        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                                <BarChart3 className="w-3 h-3" /> Used {reply.usageCount} times
                            </span>
                            <button
                                onClick={() => handleCopy(reply)}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                                style={{
                                    background: copiedId === reply.id ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.08)",
                                    color: copiedId === reply.id ? "#10b981" : "var(--accent-blue)",
                                }}
                            >
                                {copiedId === reply.id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">New Quick Reply</h2>
                            <button onClick={() => setShowAdd(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <input
                            type="text"
                            placeholder="Template name *"
                            value={newReply.title}
                            onChange={(e) => setNewReply({ ...newReply, title: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                            style={{ border: "1px solid var(--border-subtle)" }}
                        />
                        <textarea
                            placeholder="Message body *"
                            rows={4}
                            value={newReply.body}
                            onChange={(e) => setNewReply({ ...newReply, body: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white resize-none"
                            style={{ border: "1px solid var(--border-subtle)" }}
                        />
                        <select
                            value={newReply.category}
                            onChange={(e) => setNewReply({ ...newReply, category: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                            style={{ border: "1px solid var(--border-subtle)" }}
                        >
                            <option value="general">General</option>
                            <option value="greeting">Greeting</option>
                            <option value="pricing">Pricing</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="closing">Closing</option>
                        </select>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !newReply.title.trim() || !newReply.body.trim()}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold"
                            style={{ background: "var(--accent-blue)", color: "white", opacity: isCreating ? 0.7 : 1 }}
                        >
                            {isCreating ? "Creating..." : "Create Template"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
