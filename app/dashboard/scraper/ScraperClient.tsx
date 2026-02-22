"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, X, RefreshCw, AlertCircle, MapPin, History, Search, Briefcase, Building2, TableProperties, Link as LinkIcon, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { triggerMakeScraper } from "@/actions/scraper-webhook";
import { fetchPublicSheetCsv } from "@/actions/fetch-sheet";

export default function ScraperClient({
    initialHistory,
    isMakeConnected
}: {
    initialHistory: any[];
    isMakeConnected: boolean;
}) {
    const [activeTab, setActiveTab] = useState<"trigger" | "database">("trigger");
    const [niche, setNiche] = useState("");
    const [city, setCity] = useState("");
    const [service, setService] = useState("");

    // Google Sheets integration state
    const [sheetUrl, setSheetUrl] = useState("");
    const [savedSheetUrl, setSavedSheetUrl] = useState("");
    const [sheetData, setSheetData] = useState<any[] | null>(null);
    const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
    const [isFetchingSheet, setIsFetchingSheet] = useState(false);
    const [sheetError, setSheetError] = useState<string | null>(null);

    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    // Load saved sheet URL on mount
    useEffect(() => {
        const saved = localStorage.getItem("scraper_sheet_url");
        if (saved) {
            setSheetUrl(saved);
            setSavedSheetUrl(saved);
            loadSheetData(saved);
        }
    }, []);

    const handleSaveSheetUrl = () => {
        localStorage.setItem("scraper_sheet_url", sheetUrl);
        setSavedSheetUrl(sheetUrl);
        loadSheetData(sheetUrl);
    };

    const loadSheetData = async (url: string) => {
        if (!url) return;
        setIsFetchingSheet(true);
        setSheetError(null);
        try {
            const res = await fetchPublicSheetCsv(url);
            if (res.success && res.data) {
                setSheetData(res.data);
                if (res.data.length > 0) {
                    setSheetHeaders(Object.keys(res.data[0]));
                } else {
                    setSheetHeaders([]);
                }
            } else {
                setSheetError(res.error || "Failed to load sheet data");
            }
        } catch (e: any) {
            setSheetError(e.message);
        } finally {
            setIsFetchingSheet(false);
        }
    };

    const isFormValid = niche.trim().length > 0 && city.trim().length > 0 && service.trim().length > 0;

    const handleTriggerCampaign = async () => {
        if (!isFormValid) return;
        setIsSending(true);
        setSendResult(null);
        try {
            const result = await triggerMakeScraper(niche, city, service);
            setSendResult(result);
            if (result.success) {
                setTimeout(() => {
                    setSendResult(null);
                    setNiche("");
                    setCity("");
                    setService("");
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
                <h2 className="text-xl font-bold mb-2 text-white">Scraper Not Connected</h2>
                <p className="max-w-md text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                    To use the Google Maps Scraper module, you need to configure your Make Automation (Scraper) Webhook URL in Settings.
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
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12 relative flex flex-col h-[calc(100vh-120px)]">

            {/* Background Orbs */}
            <div className="absolute top-10 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header & Tabs Container */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 pt-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        Hyper-Local Targeting
                    </div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <Search className="w-7 h-7" style={{ color: "var(--accent-blue)" }} />
                        Google Maps Scraper
                    </h1>
                </div>

                {/* Custom Tabs */}
                <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab("trigger")}
                        className={`flex-1 md:w-40 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "trigger"
                            ? "bg-zinc-800 text-white shadow-lg shadow-black/50 border border-white/5"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Trigger
                    </button>
                    <button
                        onClick={() => setActiveTab("database")}
                        className={`flex-1 md:w-40 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === "database"
                            ? "bg-zinc-800 text-white shadow-lg shadow-black/50 border border-white/5"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            }`}
                    >
                        <TableProperties className="w-4 h-4" />
                        Leads DB
                    </button>
                </div>
            </div>

            {/* ---------------- TRIGGER TAB CONTENT ---------------- */}
            {activeTab === "trigger" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10 flex-1 min-h-[500px]">
                    {/* Trigger Card */}
                    <div className="lg:col-span-3 glass-card-static rounded-3xl overflow-hidden flex flex-col justify-between"
                        style={{
                            background: "linear-gradient(180deg, rgba(20,20,25,0.7) 0%, rgba(15,15,20,0.9) 100%)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                        }}>

                        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

                        <div className="p-8 md:p-10 flex flex-col flex-grow">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Configure Search Parameters</h2>
                                <p className="text-sm text-zinc-400 mb-8 leading-relaxed max-w-md">
                                    Provide the specific niche, location, and the service you are offering them. Gemini will use this to generate optimized map queries.
                                </p>

                                <div className="space-y-5 mb-10">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1">
                                            Your Service Offer
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Briefcase className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                            </div>
                                            <input
                                                value={service}
                                                onChange={(e) => setService(e.target.value)}
                                                placeholder="e.g. SEO Services, Website Design"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[13px] text-white outline-none transition-all duration-300"
                                                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 1px #10b981, 0 0 20px rgba(16, 185, 129, 0.1)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)"; }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1">
                                            Target Industry / Niche
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Building2 className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                            </div>
                                            <input
                                                value={niche}
                                                onChange={(e) => setNiche(e.target.value)}
                                                placeholder="e.g. Plumbers, Dentists, Roofers"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[13px] text-white outline-none transition-all duration-300"
                                                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 1px #10b981, 0 0 20px rgba(16, 185, 129, 0.1)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)"; }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pl-1">
                                            Target City & State
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                            </div>
                                            <input
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="e.g. Austin, TX"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[13px] text-white outline-none transition-all duration-300"
                                                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 1px #10b981, 0 0 20px rgba(16, 185, 129, 0.1)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(0,0,0,0.2)"; e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.1)"; }}
                                            />
                                        </div>
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
                                    disabled={isSending || !isFormValid}
                                    className="w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all relative overflow-hidden disabled:cursor-not-allowed group"
                                    style={{
                                        background: (isSending || !isFormValid) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #10b981, #059669)",
                                        color: (isSending || !isFormValid) ? "rgba(255,255,255,0.3)" : "white",
                                        border: (isSending || !isFormValid) ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.1)",
                                        boxShadow: (!isSending && isFormValid) ? "0 8px 20px -6px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
                                        transform: (!isSending && isFormValid) ? "translateY(-1px)" : "none",
                                    }}
                                >
                                    {(!isSending && isFormValid) && (
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                                    )}

                                    {isSending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin relative z-10" />
                                            <span className="relative z-10">Initializing Payload...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 relative z-10" />
                                            <span className="relative z-10">Start Scraping Script</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History Log */}
                    <div className="lg:col-span-2 glass-card-static rounded-3xl flex flex-col overflow-hidden"
                        style={{ background: "rgba(15,15,20,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>

                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-white/5">
                                    <History className="w-4 h-4 text-zinc-400" />
                                </div>
                                <h2 className="text-sm font-semibold text-white tracking-wide">Scraper Ledger</h2>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">LIVE</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 pb-6 custom-scrollbar space-y-1 relative h-full min-h-[400px]">
                            {initialHistory.length > 0 && (
                                <div className="absolute top-6 bottom-6 left-6 w-px bg-zinc-800/50 z-0 hidden sm:block" />
                            )}

                            {initialHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6 min-h-[300px]">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Search className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <h3 className="text-sm font-medium text-zinc-300 mb-1">Awaiting Transmission</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        No scraping scripts initiated.
                                    </p>
                                </div>
                            ) : (
                                initialHistory.map((item) => (
                                    <div key={item.id} className="relative z-10 flex gap-4 p-4 hover:bg-white/[0.02] rounded-2xl transition-colors group">
                                        <div className="mt-1 relative hidden sm:block">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center ring-4 ring-[#0f0f14] group-hover:ring-zinc-900 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <p className="text-xs font-semibold text-white tracking-wide">Scraper Script Engaged</p>
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
            )}

            {/* ---------------- DATABASE TAB CONTENT ---------------- */}
            {activeTab === "database" && (
                <div className="flex-1 flex flex-col relative z-10 min-h-[500px] glass-card-static rounded-3xl overflow-hidden p-1 space-y-4" style={{
                    background: "rgba(15,15,20,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>

                    {/* Top settings bar for the Sheet URL */}
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
                        <div className="flex-1 w-full max-w-2xl relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LinkIcon className="w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                            </div>
                            <input
                                placeholder="Paste your Google Sheet URL here..."
                                value={sheetUrl}
                                onChange={(e) => setSheetUrl(e.target.value)}
                                className="w-full pl-10 pr-24 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-mono"
                            />
                            {sheetUrl !== savedSheetUrl && (
                                <button
                                    onClick={handleSaveSheetUrl}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                                >
                                    Save
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {savedSheetUrl && (
                                <button
                                    onClick={() => loadSheetData(savedSheetUrl)}
                                    disabled={isFetchingSheet}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                                >
                                    {isFetchingSheet ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                    Sync Data
                                </button>
                            )}
                            <a href={savedSheetUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-all">
                                <TableProperties className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Open Sheet</span>
                            </a>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="flex-1 w-full bg-black/40 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
                        {!savedSheetUrl ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                    <TableProperties className="w-8 h-8 text-zinc-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No leads database connected</h3>
                                <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                                    Paste your Make.com destination Google Sheet URL in the field above to view scraped leads flowing in natively.
                                </p>
                            </div>
                        ) : isFetchingSheet && !sheetData ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                                <p className="text-sm text-zinc-400 font-medium">Syncing database...</p>
                            </div>
                        ) : sheetError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Sync Error</h3>
                                <p className="text-sm text-zinc-400 max-w-md leading-relaxed text-red-400/80">
                                    {sheetError}
                                </p>
                            </div>
                        ) : sheetData && sheetData.length > 0 ? (
                            <div className="overflow-auto custom-scrollbar flex-1 w-full">
                                <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                                            {sheetHeaders.map((h, i) => (
                                                <th key={`header-${i}`} className="px-4 py-3.5 font-semibold text-zinc-300 text-xs uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sheetData.map((row, i) => (
                                            <tr key={`row-${i}`} className="hover:bg-white/[0.02] transition-colors">
                                                {sheetHeaders.map((h, j) => (
                                                    <td key={`cell-${i}-${j}`} className="px-4 py-3 text-zinc-400 text-[13px] max-w-[300px] truncate">
                                                        {h.toLowerCase().includes('url') || h.toLowerCase().includes('website') ? (
                                                            row[h] ? (
                                                                <a href={row[h].startsWith('http') ? row[h] : `http://${row[h]}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                                                    {row[h]}
                                                                </a>
                                                            ) : "-"
                                                        ) : (
                                                            row[h] || "-"
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                    <Search className="w-8 h-8 text-zinc-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No Leads Found</h3>
                                <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                                    The connected Google Sheet is empty. Trigger a scrape to populate it.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
