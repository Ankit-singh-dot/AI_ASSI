"use client";

import { useState } from "react";
import { Send, CheckCircle2, X, RefreshCw, AlertCircle, FileSpreadsheet, History, Link as LinkIcon, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { triggerMakeSpreadsheetCampaign } from "@/actions/make-webhook";

export default function CampaignsClient({
    initialHistory,
    isMakeConnected
}: {
    initialHistory: any[];
    isMakeConnected: boolean;
}) {
    const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    const isUrlValid = spreadsheetUrl.includes("docs.google.com/spreadsheets");

    const handleTriggerCampaign = async () => {
        if (!spreadsheetUrl) return;
        setIsSending(true);
        setSendResult(null);
        try {
            const result = await triggerMakeSpreadsheetCampaign(spreadsheetUrl);
            setSendResult(result);
            if (result.success) {
                setTimeout(() => {
                    setSendResult(null);
                    setSpreadsheetUrl("");
                }, 4000);
            }
        } catch (e: any) {
            setSendResult({ success: false, message: e.message || "Failed to trigger webhook" });
        } finally {
            setIsSending(false);
        }
    };

    if (!isMakeConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(147, 51, 234, 0.1)" }}>
                    <AlertCircle className="w-8 h-8" style={{ color: "#9333ea" }} />
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">Make.com Not Connected</h2>
                <p className="max-w-md text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                    To use the Spreadsheet Campaigns module, you need to configure your Make.com Webhook URL in Settings.
                </p>
                <a
                    href="/dashboard/settings"
                    className="btn-primary flex items-center gap-2"
                    style={{ padding: "10px 20px", fontSize: "0.9rem" }}
                >
                    Go to Settings → Integrations
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12 relative">

            {/* Background Orbs for Premium feel */}
            <div className="absolute top-10 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Automated Sequences
                    </div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <FileSpreadsheet className="w-7 h-7" style={{ color: "var(--accent-blue)" }} />
                        Spreadsheet Campaigns
                    </h1>
                    <p className="text-sm mt-2 max-w-lg" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                        Directly trigger your complex Make.com outreach scenarios by providing a live Google Spreadsheet URL. We handle the handshake seamlessly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">

                {/* Trigger Card (Spans 3 cols on large screens) */}
                <div className="lg:col-span-3 glass-card-static rounded-3xl overflow-hidden flex flex-col justify-between"
                    style={{
                        background: "linear-gradient(180deg, rgba(20,20,25,0.7) 0%, rgba(15,15,20,0.9) 100%)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}>

                    {/* Top Decorative bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                    <div className="p-8 md:p-10 flex flex-col flex-grow">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Initialize Workflow</h2>
                            <p className="text-sm text-zinc-400 mb-8 leading-relaxed max-w-md">
                                Paste the full URL of your active Google Spreadsheet below. The webhook will instantly ping Make.com to begin processing your rows.
                            </p>

                            <div className="space-y-2 mb-10">
                                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1">
                                    Spreadsheet Reference Link
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LinkIcon className="w-4 h-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        value={spreadsheetUrl}
                                        onChange={(e) => setSpreadsheetUrl(e.target.value)}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="w-full pl-11 pr-4 py-4 rounded-xl text-[13px] text-white outline-none transition-all duration-300"
                                        style={{
                                            background: "rgba(0,0,0,0.2)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = "var(--accent-blue)";
                                            e.currentTarget.style.background = "rgba(0,0,0,0.4)";
                                            e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent-blue), 0 0 20px rgba(59, 130, 246, 0.1)";
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                            e.currentTarget.style.background = "rgba(0,0,0,0.2)";
                                            e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)";
                                        }}
                                    />

                                    {/* Success Indicator inside input */}
                                    {spreadsheetUrl && isUrlValid && (
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none animate-in fade-in zoom-in">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            {sendResult && (
                                <div className={`flex items-start gap-3 p-4 rounded-xl text-xs animate-in slide-in-from-bottom-2 ${sendResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {sendResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <X className="w-4 h-4 shrink-0 mt-0.5" />}
                                    <span className="leading-relaxed font-medium">{sendResult.message}</span>
                                </div>
                            )}

                            <button
                                onClick={handleTriggerCampaign}
                                disabled={isSending || !isUrlValid}
                                className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all relative overflow-hidden disabled:cursor-not-allowed group"
                                style={{
                                    background: (isSending || !isUrlValid) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                                    color: (isSending || !isUrlValid) ? "rgba(255,255,255,0.3)" : "white",
                                    border: (isSending || !isUrlValid) ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.1)",
                                    boxShadow: (!isSending && isUrlValid) ? "0 8px 20px -6px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
                                    transform: (!isSending && isUrlValid) ? "translateY(-1px)" : "none",
                                }}
                            >
                                {/* Button Hover Gradient */}
                                {(!isSending && isUrlValid) && (
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                                )}

                                {isSending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin relative z-10" />
                                        <span className="relative z-10">Initializing Payload...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">Trigger Campaign Sequence</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* History Log (Spans 2 cols) */}
                <div className="lg:col-span-2 glass-card-static rounded-3xl flex flex-col overflow-hidden"
                    style={{
                        background: "rgba(15,15,20,0.6)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        height: "500px"
                    }}>

                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-white/5">
                                <History className="w-4 h-4 text-zinc-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-white tracking-wide">Activity Ledger</h2>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 px-2 py-0.5 rounded border border-white/5 bg-white/5">
                            LIVE
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 pb-6 custom-scrollbar space-y-1 relative">
                        {/* Timeline vertical line */}
                        {initialHistory.length > 0 && (
                            <div className="absolute top-6 bottom-6 left-6 w-px bg-zinc-800/50 z-0 hidden sm:block" />
                        )}

                        {initialHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <History className="w-5 h-5 text-zinc-600" />
                                </div>
                                <h3 className="text-sm font-medium text-zinc-300 mb-1">Awaiting Transmission</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    No ledger entries found. Paste a spreadsheet link to record your first execution.
                                </p>
                            </div>
                        ) : (
                            initialHistory.map((item) => (
                                <div key={item.id} className="relative z-10 flex gap-4 p-4 hover:bg-white/[0.02] rounded-2xl transition-colors group">

                                    {/* Timeline dot */}
                                    <div className="mt-1 relative hidden sm:block">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center ring-4 ring-[#0f0f14] group-hover:ring-zinc-900 transition-all">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <p className="text-xs font-semibold text-white tracking-wide">
                                                Webhook Triggered
                                            </p>
                                            <span className="text-[10px] text-zinc-500 tabular-nums shrink-0 mt-0.5 ml-2">
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-zinc-400 leading-relaxed break-words pr-2">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
