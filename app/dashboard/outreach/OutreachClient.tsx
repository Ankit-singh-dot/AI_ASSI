"use client";

import { useState, useEffect } from "react";
import {
    Sparkles, Send, Copy, Check, User, MessageSquare, Mail, Instagram,
    Loader2, CheckCircle, AlertCircle, Phone, PhoneCall, PhoneOff,
    RefreshCw, Clock, Users, PlayCircle
} from "lucide-react";
import { generateOutreachMessage } from "@/actions/ai-outreach";
import { sendOutreachEmail } from "@/actions/send-email";
import { triggerVapiCall, getCallHistory, syncCallStatus, triggerBulkCalls } from "@/actions/voice-call";
import { formatDistanceToNow } from "date-fns";

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

const callStatusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    queued: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "Queued" },
    ringing: { icon: PhoneCall, color: "#3b82f6", bg: "rgba(59,130,246,0.08)", label: "Ringing" },
    "in-progress": { icon: PhoneCall, color: "#6366f1", bg: "rgba(99,102,241,0.08)", label: "In Progress" },
    completed: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.08)", label: "Completed" },
    failed: { icon: PhoneOff, color: "#ef4444", bg: "rgba(239,68,68,0.08)", label: "Failed" },
};

export default function OutreachClient({ leads, initialCallHistory }: { leads: any[]; initialCallHistory?: any[] }) {
    // Tab state
    const [activeTab, setActiveTab] = useState<"composer" | "voice">("composer");

    // --- AI Composer state ---
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedChannel, setSelectedChannel] = useState("whatsapp");
    const [selectedTone, setSelectedTone] = useState("casual");
    const [generatedMessage, setGeneratedMessage] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [leadInfo, setLeadInfo] = useState<any>(null);
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    // --- Voice Calls state ---
    const [callHistory, setCallHistory] = useState<any[]>(initialCallHistory || []);
    const [selectedLeadForCall, setSelectedLeadForCall] = useState("");
    const [customPhoneNumber, setCustomPhoneNumber] = useState("");
    const [isCalling, setIsCalling] = useState(false);
    const [callError, setCallError] = useState<string | null>(null);
    const [callSuccess, setCallSuccess] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    // Bulk calling
    const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set());
    const [isBulkCalling, setIsBulkCalling] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);

    // Load call history when switching to voice tab
    useEffect(() => {
        if (activeTab === "voice" && callHistory.length === 0) {
            loadCallHistory();
        }
    }, [activeTab]);

    const loadCallHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const history = await getCallHistory();
            setCallHistory(history);
        } catch (err) {
            console.error("Failed to load call history:", err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // AI Composer handlers
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

    // Voice Call handlers
    const handleVoiceCall = async () => {
        setCallError(null);
        setCallSuccess(null);

        const lead = leads.find((l) => l.id === selectedLeadForCall);
        const phoneNumber = customPhoneNumber || lead?.phone;

        if (!phoneNumber) {
            setCallError("Please enter a phone number or select a lead with a phone number.");
            return;
        }

        setIsCalling(true);
        try {
            const result = await triggerVapiCall(selectedLeadForCall || null, phoneNumber);
            setCallSuccess(`Call initiated to ${phoneNumber}! VAPI is connecting...`);
            setCallHistory((prev) => [result, ...prev]);
            setCustomPhoneNumber("");
        } catch (err: any) {
            setCallError(err.message || "Failed to initiate call");
        } finally {
            setIsCalling(false);
        }
    };

    const handleRefreshStatus = async (voiceCallId: string) => {
        try {
            const updated = await syncCallStatus(voiceCallId);
            setCallHistory((prev) =>
                prev.map((c) => (c.id === voiceCallId ? { ...c, ...updated } : c))
            );
        } catch (err) {
            console.error("Failed to sync status:", err);
        }
    };

    const handleBulkCall = async () => {
        const selected = leads.filter((l) => selectedForBulk.has(l.id) && l.phone);
        if (selected.length === 0) return;

        setIsBulkCalling(true);
        setBulkProgress(0);

        const leadsToCall = selected.map((l) => ({ id: l.id, phone: l.phone }));
        try {
            const results = await triggerBulkCalls(leadsToCall);
            const successCount = results.filter((r) => r.success).length;
            setCallSuccess(`${successCount}/${leadsToCall.length} calls initiated successfully!`);
            setSelectedForBulk(new Set());
            await loadCallHistory();
        } catch (err: any) {
            setCallError(err.message || "Bulk call failed");
        } finally {
            setIsBulkCalling(false);
        }
    };

    const toggleBulkSelect = (leadId: string) => {
        setSelectedForBulk((prev) => {
            const next = new Set(prev);
            if (next.has(leadId)) next.delete(leadId);
            else next.add(leadId);
            return next;
        });
    };

    const leadsWithPhone = leads.filter((l) => l.phone);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Sparkles className="w-6 h-6" style={{ color: "var(--accent-blue)" }} />
                        AI Outreach
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                        Generate messages and make AI voice calls
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                <button
                    onClick={() => setActiveTab("composer")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                        background: activeTab === "composer" ? "var(--gradient-hero)" : "transparent",
                        color: activeTab === "composer" ? "white" : "var(--text-muted)",
                    }}
                >
                    <Sparkles className="w-4 h-4" />
                    AI Composer
                </button>
                <button
                    onClick={() => setActiveTab("voice")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                        background: activeTab === "voice" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
                        color: activeTab === "voice" ? "white" : "var(--text-muted)",
                    }}
                >
                    <Phone className="w-4 h-4" />
                    Voice Calls
                </button>
            </div>

            {/* ── AI Composer Tab ── */}
            {activeTab === "composer" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Config Panel */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="glass-card-static p-5">
                            <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Select Lead</label>
                            {leads.length === 0 ? (
                                <p className="text-xs text-zinc-500">No leads yet. Add leads from the Leads page first.</p>
                            ) : (
                                <select value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none" style={{ border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
                                    <option value="">Choose a lead...</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>{lead.name} — {lead.email || lead.phone || "no contact"}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="glass-card-static p-5">
                            <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Channel</label>
                            <div className="flex gap-2">
                                {channels.map((ch) => (
                                    <button key={ch.id} onClick={() => setSelectedChannel(ch.id)} className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200" style={{ border: `2px solid ${selectedChannel === ch.id ? ch.color : "var(--border-subtle)"}`, background: selectedChannel === ch.id ? `${ch.color}08` : "transparent" }}>
                                        <ch.icon className="w-5 h-5" style={{ color: selectedChannel === ch.id ? ch.color : "var(--text-muted)" }} />
                                        <span className="text-xs font-medium" style={{ color: selectedChannel === ch.id ? ch.color : "var(--text-muted)" }}>{ch.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card-static p-5">
                            <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Tone</label>
                            <div className="flex gap-2">
                                {tones.map((t) => (
                                    <button key={t.id} onClick={() => setSelectedTone(t.id)} className="flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200" style={{ border: `2px solid ${selectedTone === t.id ? "var(--accent-blue)" : "var(--border-subtle)"}`, background: selectedTone === t.id ? "rgba(59,130,246,0.06)" : "transparent", color: selectedTone === t.id ? "var(--accent-blue)" : "var(--text-muted)" }}>
                                        {t.emoji} {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={handleGenerate} disabled={isGenerating || !selectedLead} className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2" style={{ background: "var(--gradient-hero)", color: "white", opacity: isGenerating || !selectedLead ? 0.6 : 1 }}>
                            {isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>) : (<><Sparkles className="w-4 h-4" /> Generate Message</>)}
                        </button>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-3">
                        <div className="glass-card-static p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Generated Message</h3>
                                {generatedMessage && (
                                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all" style={{ background: copied ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.08)", color: copied ? "#10b981" : "var(--accent-blue)" }}>
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
                                    <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
                                        {generatedMessage}
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={handleGenerate} className="flex-1 py-2 rounded-xl text-xs font-medium transition-all" style={{ color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}>🔄 Regenerate</button>
                                        {selectedChannel === "email" && leadInfo?.email && (
                                            <button onClick={handleSendEmail} disabled={isSending} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5" style={{ background: "var(--gradient-hero)", color: "white", opacity: isSending ? 0.6 : 1 }}>
                                                {isSending ? (<><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>) : (<><Send className="w-3 h-3" /> Send Email</>)}
                                            </button>
                                        )}
                                    </div>
                                    {sendResult && (
                                        <div className="mt-3 p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: sendResult.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${sendResult.success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, color: sendResult.success ? "#10b981" : "#ef4444" }}>
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
                                            Select a lead, channel, and tone, then click &quot;Generate Message&quot;
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Voice Calls Tab ── */}
            {activeTab === "voice" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left — Call Launcher */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Single Call */}
                        <div className="glass-card-static p-5 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Phone className="w-4 h-4" style={{ color: "#6366f1" }} />
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Make a Call</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Select Lead</label>
                                <select
                                    value={selectedLeadForCall}
                                    onChange={(e) => {
                                        setSelectedLeadForCall(e.target.value);
                                        const lead = leads.find((l) => l.id === e.target.value);
                                        if (lead?.phone) setCustomPhoneNumber(lead.phone);
                                    }}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none"
                                    style={{ border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                >
                                    <option value="">Choose a lead (optional)...</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.name} {lead.phone ? `— ${lead.phone}` : "— no phone"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={customPhoneNumber}
                                    onChange={(e) => setCustomPhoneNumber(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none"
                                    style={{ border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                />
                            </div>

                            <button
                                onClick={handleVoiceCall}
                                disabled={isCalling || (!customPhoneNumber && !leads.find((l) => l.id === selectedLeadForCall)?.phone)}
                                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                style={{
                                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                    color: "white",
                                    opacity: isCalling ? 0.6 : 1,
                                }}
                            >
                                {isCalling ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Calling...</>
                                ) : (
                                    <><PhoneCall className="w-4 h-4" /> 🤖 Start AI Call</>
                                )}
                            </button>

                            {callError && (
                                <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}>
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    {callError}
                                </div>
                            )}
                            {callSuccess && (
                                <div className="p-3 rounded-xl text-xs flex items-center gap-2" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
                                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    {callSuccess}
                                </div>
                            )}
                        </div>

                        {/* Bulk Call */}
                        <div className="glass-card-static p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" style={{ color: "#6366f1" }} />
                                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Bulk Call</h3>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                                    {selectedForBulk.size} selected
                                </span>
                            </div>

                            {leadsWithPhone.length === 0 ? (
                                <p className="text-xs text-zinc-500">No leads with phone numbers found.</p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {leadsWithPhone.map((lead) => (
                                        <label
                                            key={lead.id}
                                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedForBulk.has(lead.id)}
                                                onChange={() => toggleBulkSelect(lead.id)}
                                                className="accent-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{lead.name}</p>
                                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{lead.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleBulkCall}
                                disabled={isBulkCalling || selectedForBulk.size === 0}
                                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                                style={{
                                    background: selectedForBulk.size > 0 ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "var(--bg-primary)",
                                    color: selectedForBulk.size > 0 ? "white" : "var(--text-muted)",
                                    border: selectedForBulk.size > 0 ? "none" : "1px solid var(--border-subtle)",
                                    opacity: isBulkCalling ? 0.6 : 1,
                                }}
                            >
                                {isBulkCalling ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" /> Calling {selectedForBulk.size} leads...</>
                                ) : (
                                    <><PlayCircle className="w-3 h-3" /> Call {selectedForBulk.size} Leads</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right — Call History */}
                    <div className="lg:col-span-3">
                        <div className="glass-card-static p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Call History</h3>
                                <button
                                    onClick={loadCallHistory}
                                    disabled={isLoadingHistory}
                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin" : ""}`} />
                                </button>
                            </div>

                            {isLoadingHistory && callHistory.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
                                </div>
                            ) : callHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Phone className="w-10 h-10 mb-3" style={{ color: "var(--border-subtle)" }} />
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No calls yet. Make your first AI call!</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {callHistory.map((call) => {
                                        const statusCfg = callStatusConfig[call.status] || callStatusConfig.queued;
                                        const StatusIcon = statusCfg.icon;
                                        return (
                                            <div
                                                key={call.id}
                                                className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.02]"
                                                style={{ border: "1px solid var(--border-subtle)" }}
                                            >
                                                {/* Avatar */}
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase"
                                                    style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white" }}
                                                >
                                                    {call.lead?.name?.charAt(0) || call.phoneNumber.slice(-2)}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                                        {call.lead?.name || call.phoneNumber}
                                                    </p>
                                                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                                        {call.phoneNumber} • {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>

                                                {/* Duration */}
                                                {call.duration && (
                                                    <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                                                        {Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, "0")}
                                                    </span>
                                                )}

                                                {/* Status Badge */}
                                                <span
                                                    className="text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1"
                                                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusCfg.label}
                                                </span>

                                                {/* Refresh */}
                                                {(call.status === "queued" || call.status === "ringing" || call.status === "in-progress") && (
                                                    <button
                                                        onClick={() => handleRefreshStatus(call.id)}
                                                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                                        style={{ color: "var(--text-muted)" }}
                                                        title="Refresh status"
                                                    >
                                                        <RefreshCw className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
