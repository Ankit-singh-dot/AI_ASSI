"use client";

import { useState } from "react";
import { Sparkles, Send, Copy, Check, User, MessageSquare, Mail, Instagram, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { generateOutreachMessage } from "@/actions/ai-outreach";
import { sendOutreachEmail } from "@/actions/send-email";

const channels = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "#25D366" },
    { id: "email", label: "Email", icon: Mail, color: "#EA4335" },
    { id: "instagram", label: "Instagram", icon: Instagram, color: "#E4405F" },
];

const tones = [
    { id: "casual", label: "Casual", emoji: "😊" },
    { id: "formal", label: "Formal", emoji: "💼" },
    { id: "urgent", label: "Urgent", emoji: "⚡" },
];

export default function OutreachClient({ leads }: { leads: any[] }) {
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("whatsapp");
    const [selectedTone, setSelectedTone] = useState("casual");
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [leadInfo, setLeadInfo] = useState<any>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleGenerate = async () => {
        if (!selectedLead) return;
        setIsGenerating(true);
        setGeneratedMessage("");
        try {
            const result = await generateOutreachMessage(selectedLead, selectedChannel, selectedTone);
            setGeneratedMessage(result.message);
            setLeadInfo(result.lead);
        } catch (error) {
            console.error("Failed to generate:", error);
            setGeneratedMessage("Failed to generate message. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendEmail = async () => {
        if (!leadInfo?.email || !generatedMessage) return;
        setIsSending(true);
        setSendResult(null);
        try {
            const result = await sendOutreachEmail({
                to: leadInfo.email,
                subject: `Hi ${leadInfo.name} — Quick message from us`,
                body: generatedMessage,
                leadId: selectedLead,
            });
            setSendResult(result);
        } catch (e: any) {
            setSendResult({ success: false, message: e.message || "Failed to send" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Sparkles className="w-6 h-6" style={{ color: "var(--accent-blue)" }} />
                    AI Outreach Composer
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Generate personalized outreach messages powered by Gemini AI
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Config Panel */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Lead Selector */}
                    <div className="glass-card-static p-5">
                        <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                            Select Lead
                        </label>
                        {leads.length === 0 ? (
                            <p className="text-xs text-zinc-500">No leads yet. Add leads from the Leads page first.</p>
                        ) : (
                            <select
                                value={selectedLead}
                                onChange={(e) => setSelectedLead(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none"
                                style={{ border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                            >
                                <option value="">Choose a lead...</option>
                                {leads.map((lead) => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.name} — {lead.email || lead.phone || "no contact"}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Channel */}
                    <div className="glass-card-static p-5">
                        <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                            Channel
                        </label>
                        <div className="flex gap-2">
                            {channels.map((ch) => (
                                <button
                                    key={ch.id}
                                    onClick={() => setSelectedChannel(ch.id)}
                                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                                    style={{
                                        border: `2px solid ${selectedChannel === ch.id ? ch.color : "var(--border-subtle)"}`,
                                        background: selectedChannel === ch.id ? `${ch.color}08` : "transparent",
                                    }}
                                >
                                    <ch.icon className="w-5 h-5" style={{ color: selectedChannel === ch.id ? ch.color : "var(--text-muted)" }} />
                                    <span className="text-xs font-medium" style={{ color: selectedChannel === ch.id ? ch.color : "var(--text-muted)" }}>
                                        {ch.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone */}
                    <div className="glass-card-static p-5">
                        <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                            Tone
                        </label>
                        <div className="flex gap-2">
                            {tones.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTone(t.id)}
                                    className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200"
                                    style={{
                                        border: `2px solid ${selectedTone === t.id ? "var(--accent-blue)" : "var(--border-subtle)"}`,
                                        background: selectedTone === t.id ? "rgba(59,130,246,0.06)" : "transparent",
                                        color: selectedTone === t.id ? "var(--accent-blue)" : "var(--text-muted)",
                                    }}
                                >
                                    {t.emoji} {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !selectedLead}
                        className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        style={{
                            background: "var(--gradient-hero)",
                            color: "white",
                            opacity: isGenerating || !selectedLead ? 0.6 : 1,
                        }}
                    >
                        {isGenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="w-4 h-4" /> Generate Message</>
                        )}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="lg:col-span-3">
                    <div className="glass-card-static p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                Generated Message
                            </h3>
                            {generatedMessage && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                                    style={{
                                        background: copied ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.08)",
                                        color: copied ? "#10b981" : "var(--accent-blue)",
                                    }}
                                >
                                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                                </button>
                            )}
                        </div>

                        {isGenerating ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>AI is composing your message...</p>
                                </div>
                            </div>
                        ) : generatedMessage ? (
                            <div className="flex-1">
                                {leadInfo && (
                                    <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                                            {leadInfo.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{leadInfo.name}</p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{leadInfo.email || leadInfo.phone}</p>
                                        </div>
                                    </div>
                                )}
                                <div
                                    className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                                >
                                    {generatedMessage}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={handleGenerate}
                                        className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                                        style={{ color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}
                                    >
                                        🔄 Regenerate
                                    </button>
                                    {selectedChannel === "email" && leadInfo?.email && (
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={isSending}
                                            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                                            style={{
                                                background: "var(--gradient-hero)",
                                                color: "white",
                                                opacity: isSending ? 0.6 : 1,
                                            }}
                                        >
                                            {isSending ? (
                                                <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>
                                            ) : (
                                                <><Send className="w-3 h-3" /> Send Email</>
                                            )}
                                        </button>
                                    )}
                                </div>
                                {sendResult && (
                                    <div
                                        className="mt-3 p-3 rounded-xl text-xs flex items-center gap-2"
                                        style={{
                                            background: sendResult.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                                            border: `1px solid ${sendResult.success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                                            color: sendResult.success ? "#10b981" : "#ef4444",
                                        }}
                                    >
                                        {sendResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                        {sendResult.message}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <Send className="w-10 h-10 mx-auto" style={{ color: "var(--border-subtle)" }} />
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                        Select a lead, channel, and tone, then click "Generate Message"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
