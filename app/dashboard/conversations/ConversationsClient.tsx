"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Send, User, Tag, Phone, Mail, Instagram, MessageCircle, RefreshCw, AlertCircle } from "lucide-react";
import { getConversation, sendReply, getConversations } from "@/actions/conversations";
import { motion, AnimatePresence } from "framer-motion";

function PlatformIcon({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) {
    switch (platform) {
        case "whatsapp": return <MessageCircle className={`${className} text-[#25D366] drop-shadow-md`} />;
        case "instagram": return <Instagram className={`${className} text-[#E1306C] drop-shadow-md`} />;
        case "website_forms": return <Mail className={`${className} text-blue-500 drop-shadow-md`} />;
        default: return <MessageCircle className={`${className} text-gray-500`} />;
    }
}

export default function ConversationsClient({ initialConversations, quickReplies }: { initialConversations: any[], quickReplies: any[] }) {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeConv, setActiveConv] = useState<any>(null);
    const [isLoadingConv, setIsLoadingConv] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            const updated = await getConversations();
            setConversations(updated);

            if (activeId) {
                const updatedActive = await getConversation(activeId);
                setActiveConv(updatedActive);
            }
        }, 15000); // 15s polling

        return () => clearInterval(interval);
    }, [activeId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeConv?.messages]);

    const handleSelectConversation = async (id: string) => {
        setActiveId(id);
        setIsLoadingConv(true);
        setErrorMsg(null);
        // Optimistically clear unread on list
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
        );
        try {
            const data = await getConversation(id);
            setActiveConv(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingConv(false);
        }
    };

    const handleSend = async () => {
        if (!replyText.trim() || !activeId) return;
        setIsSending(true);

        // Optimistic UI update
        const tempMsg = {
            id: `temp-${Date.now()}`,
            sender: "agent",
            text: replyText,
            createdAt: new Date().toISOString(),
        };

        setActiveConv((prev: any) => ({
            ...prev,
            messages: [...prev.messages, tempMsg]
        }));

        const textToSend = replyText;
        setReplyText("");

        try {
            await sendReply(activeId, textToSend);
            setErrorMsg(null);
            // Refresh
            const refreshed = await getConversation(activeId);
            setActiveConv(refreshed);
            const refreshList = await getConversations();
            setConversations(refreshList);
        } catch (e: any) {
            console.error("Failed to send", e);
            setErrorMsg(e.message || "Failed to send message via Meta API.");
            // Revert optimistic if failed
            const refreshed = await getConversation(activeId);
            setActiveConv(refreshed);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#0E0E0E]">
            {/* Left Pane: Inbox List */}
            <div className="w-80 border-r border-[#2C2C2C] flex flex-col bg-[#141414]">
                <div className="p-4 border-b border-[#2C2C2C] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white tracking-wide">Inbox</h2>
                    <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">{conversations.length} Active</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-6 text-center text-white/50 text-sm">No active conversations</div>
                    ) : (
                        conversations.map((c: any) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleSelectConversation(c.id)}
                                className={`p-4 border-b border-[#2C2C2C]/50 cursor-pointer transition-all relative group overflow-hidden ${activeId === c.id
                                    ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-l-2 border-l-indigo-500'
                                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <PlatformIcon platform={c.channel} />
                                        <h3 className={`font-medium ${c.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                                            {c.lead?.name || "Unknown"}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                                        {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className={`text-xs truncate max-w-[200px] ${c.unreadCount > 0 ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                                        {c.messages?.[0]?.sender === "agent" ? <span className="font-semibold text-indigo-400">You: </span> : ""}
                                        {c.messages?.[0]?.text || "New conversation"}
                                    </p>
                                    {c.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-indigo-500/20">
                                            {c.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Middle Pane: Chat History */}
            <div className="flex-1 flex flex-col bg-[#0A0A0A] relative">
                {!activeId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/40">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-[#2C2C2C] bg-[#141414] flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-white font-semibold text-lg">{activeConv?.lead?.name || "Loading..."}</h2>
                                <p className="text-xs text-white/50 flex items-center gap-1">
                                    <PlatformIcon platform={activeConv?.channel || ""} />
                                    via {activeConv?.channel === "whatsapp" ? "WhatsApp" : activeConv?.channel === "website_forms" ? "Website" : "Instagram"}
                                    {activeConv?.language && (
                                        <span className="ml-2 text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                                            {activeConv.language === "hi" ? "🇮🇳 Hindi" : "🇬🇧 English"}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {activeConv?.botPhase && activeConv.botPhase !== "none" && (
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${activeConv.botPhase === "ai_chat" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                            activeConv.botPhase === "language_select" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        }`}>
                                        {activeConv.botPhase === "ai_chat" ? "🤖 AI Handling" :
                                            activeConv.botPhase === "language_select" ? "🗣️ Language Select" :
                                                "👤 Handed Off"}
                                    </span>
                                )}
                                <button onClick={() => {
                                    handleSelectConversation(activeId);
                                }} className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors">
                                    <RefreshCw className={`w-4 h-4 ${isLoadingConv ? 'animate-spin cursor-not-allowed text-white/20' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-[#0A0A0A]">
                            <AnimatePresence>
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 z-20 backdrop-blur-md"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        <span className="text-xs text-red-400 font-medium">{errorMsg}</span>
                                        <button onClick={() => setErrorMsg(null)} className="ml-2 text-white/40 hover:text-white">✕</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isLoadingConv && !activeConv?.messages ? (
                                <div className="text-center text-white/40 mt-10">Loading messages...</div>
                            ) : (
                                <>
                                    <div className="text-center text-xs text-white/30 my-4 uppercase tracking-widest bg-black/20 py-1.5 px-4 rounded-full w-max mx-auto border border-white/5">
                                        <span className="text-indigo-400/50">✦</span> Conversation Started {activeConv?.createdAt ? format(new Date(activeConv.createdAt), "MMM d, yyyy") : ""} <span className="text-indigo-400/50">✦</span>
                                    </div>
                                    {activeConv?.messages?.map((msg: any, i: number) => {
                                        const isAgent = msg.sender === "agent" || msg.sender === "ai";
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                key={msg.id || i}
                                                className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-md rounded-2xl px-4 py-2.5 ${isAgent
                                                    ? 'bg-[#1E1E24] text-white/95 rounded-br-sm border border-white/10'
                                                    : 'bg-[#141415] text-white/95 rounded-bl-sm border border-white/5'
                                                    }`}>
                                                    <p className="text-[14px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                    <p className={`text-[10px] mt-1.5 font-medium tracking-wide text-right ${isAgent ? 'text-white/40' : 'text-white/30'}`}>
                                                        {format(new Date(msg.createdAt), "h:mm a")} {msg.sender === "ai" && "• AI"}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Compose Area */}
                        <div className="p-4 bg-[#141414] border-t border-[#2C2C2C]">
                            <div className="max-w-4xl mx-auto flex gap-2">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Type your message... (Press Enter to send)"
                                    className="flex-1 bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none h-12 min-h-[48px] max-h-32 transition-all placeholder:text-white/30 shadow-inner overflow-hidden"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!replyText.trim() || isSending}
                                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-indigo-900/50 disabled:text-indigo-300 disabled:cursor-not-allowed text-white px-5 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </button>
                            </div>

                            {/* Quick Replies Strip */}
                            {quickReplies && quickReplies.length > 0 && (
                                <div className="max-w-4xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider whitespace-nowrap px-1">Quick Replies:</span>
                                    {quickReplies.map((qr: any) => (
                                        <button
                                            key={qr.id}
                                            onClick={() => setReplyText(qr.body)}
                                            className="text-xs bg-[#242424] hover:bg-white/10 text-white/70 border border-[#2C2C2C] px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                                        >
                                            {qr.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Right Pane: Lead Context */}
            <div className="w-72 border-l border-[#2C2C2C] bg-[#141414] overflow-y-auto">
                {!activeConv ? (
                    <div className="flex h-full items-center justify-center text-white/20 text-sm">
                        No context available
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex flex-col items-center mb-8 pt-4">
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4">
                                {activeConv.lead?.name?.[0] || "?"}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 tracking-tight text-center">{activeConv.lead?.name}</h3>
                            <span className="text-xs px-3 py-1 bg-white/5 border border-white/10 text-white/60 rounded-full">
                                Score: {activeConv.lead?.score || 0}/100
                            </span>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2 font-semibold">
                                    <User className="w-3 h-3" /> Contact Info
                                </h4>
                                <div className="space-y-2">
                                    {activeConv.lead?.phone && (
                                        <div className="flex flex-col px-3 py-2.5 bg-black/20 rounded-lg border border-white/5 gap-0.5">
                                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Phone</span>
                                            <span className="text-sm font-medium text-white/90 tracking-wide">{activeConv.lead.phone}</span>
                                        </div>
                                    )}
                                    {activeConv.lead?.email && (
                                        <div className="flex flex-col px-3 py-2.5 bg-black/20 rounded-lg border border-white/5 gap-0.5">
                                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Email</span>
                                            <span className="text-sm font-medium text-white/90 truncate w-full" title={activeConv.lead.email}>{activeConv.lead.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2 font-semibold">
                                    <Tag className="w-3 h-3" /> Status & Tags
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md capitalize font-medium shadow-sm">
                                        {activeConv.lead?.status}
                                    </span>
                                    <span className="text-xs bg-[#242424] text-white/70 border border-[#2C2C2C] px-2.5 py-1 rounded-md capitalize font-medium shadow-sm">
                                        Source: {activeConv.lead?.source}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeConv.lead?.tags?.length ? activeConv.lead.tags.map((tag: string) => (
                                        <span key={tag} className="text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded border border-white/5">
                                            {tag}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-white/30 italic">No tags added</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
