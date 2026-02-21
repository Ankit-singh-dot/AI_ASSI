"use client";

import { useState } from "react";
import { Search, Phone, Mail, MessageSquare, Send, Paperclip, Smile, MoreHorizontal, Bot } from "lucide-react";
import { sendMessage, simulateCustomerMessage } from "@/actions/conversations";
import { format } from "date-fns";

type ClientProps = {
    initialConversations: any[];
};

const channelIcon: any = { whatsapp: MessageSquare, email: Mail, web: Globe };
const channelColor: any = { whatsapp: "#25D366", email: "#EA4335", web: "#06b6d4" };
import { Globe } from "lucide-react";

export default function ConversationsClient({ initialConversations }: ClientProps) {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConvoId, setActiveConvoId] = useState<string | null>(
        initialConversations.length > 0 ? initialConversations[0].id : null
    );
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const active = conversations.find((c) => c.id === activeConvoId);
    const messages = active?.messages || [];

    const handleSend = async () => {
        if (!inputText.trim() || !activeConvoId) return;

        const text = inputText;
        setInputText("");
        setIsSending(true);

        try {
            // Optimistically add message
            setConversations(prev => prev.map(c => {
                if (c.id === activeConvoId) {
                    return {
                        ...c,
                        messages: [...c.messages, {
                            id: "temp-" + Date.now(),
                            sender: "agent",
                            text,
                            createdAt: new Date()
                        }]
                    };
                }
                return c;
            }));

            // If text starts with !sim , it simulates a customer message instead
            if (text.startsWith("!sim ")) {
                await simulateCustomerMessage(activeConvoId, text.replace("!sim ", ""));
            } else {
                await sendMessage(activeConvoId, text);
            }

            // In a real app we would re-fetch or rely on Server Actions + revalidatePath
            // We'll just trigger a hard refresh here for simplicity to get true DB state
            window.location.reload();

        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div
            className="flex h-[calc(100vh-7rem)] rounded-2xl overflow-hidden animate-fade-in"
            style={{ border: "1px solid var(--border-subtle)" }}
        >
            {/* Sidebar — Conversation List */}
            <div
                className="w-[340px] flex-shrink-0 flex flex-col"
                style={{
                    background: "var(--bg-secondary)",
                    borderRight: "1px solid var(--border-subtle)",
                }}
            >
                {/* Search */}
                <div className="p-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <div
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                    >
                        <Search className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="bg-transparent text-sm outline-none w-full"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500">No conversations yet.</div>
                    ) : conversations.map((convo) => {
                        const ChannelIcon = channelIcon[convo.channel.toLowerCase()] || MessageSquare;
                        const cColor = channelColor[convo.channel.toLowerCase()] || "#ffffff";
                        const isActive = activeConvoId === convo.id;
                        const lastMsg = convo.messages[convo.messages.length - 1];

                        return (
                            <button
                                key={convo.id}
                                onClick={() => setActiveConvoId(convo.id)}
                                className="w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors duration-150"
                                style={{
                                    background: isActive ? "rgba(59,130,246,0.08)" : "transparent",
                                    borderBottom: "1px solid var(--border-subtle)",
                                    borderLeft: isActive ? "3px solid var(--accent-blue)" : "3px solid transparent",
                                }}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                                        style={{ background: "var(--gradient-hero)", color: "white" }}
                                    >
                                        {convo.lead.avatar || convo.lead.name.substring(0, 2)}
                                    </div>
                                    <ChannelIcon
                                        className="w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 rounded-full p-0.5"
                                        style={{ background: "var(--bg-secondary)", color: cColor }}
                                    />
                                </div>
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                            {convo.lead.name}
                                        </span>
                                        <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                            {format(new Date(convo.updatedAt), "HH:mm")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                            {lastMsg ? lastMsg.text : "No messages yet"}
                                        </p>
                                        {convo.unreadCount > 0 && (
                                            <span
                                                className="ml-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                style={{ background: "var(--accent-blue)", color: "white" }}
                                            >
                                                {convo.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col" style={{ background: "var(--bg-primary)" }}>
                {active ? (
                    <>
                        {/* Chat header */}
                        <div
                            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                            style={{
                                background: "var(--bg-secondary)",
                                borderBottom: "1px solid var(--border-subtle)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                                    style={{ background: "var(--gradient-hero)", color: "white" }}
                                >
                                    {active.lead.avatar || active.lead.name.substring(0, 2)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {active.lead.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs capitalize" style={{ color: channelColor[active.channel.toLowerCase()] || "white" }}>
                                            {active.channel}
                                        </span>
                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            • Score: {active.score}
                                        </span>
                                        <span className="text-xs">
                                            {active.sentiment === "positive" ? "😊" : active.sentiment === "neutral" ? "😐" : "😞"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                    <Phone className="w-4 h-4" />
                                </button>
                                <button className="p-2 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg: any) => {
                                const isCustomer = msg.sender === "customer";
                                const isAI = msg.sender === "ai";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
                                    >
                                        <div
                                            className="max-w-[70%] px-4 py-3 rounded-2xl"
                                            style={{
                                                background: isCustomer
                                                    ? "var(--bg-secondary)"
                                                    : isAI
                                                        ? "rgba(59,130,246,0.12)"
                                                        : "rgba(16,185,129,0.12)",
                                                border: `1px solid ${isCustomer
                                                    ? "var(--border-subtle)"
                                                    : isAI
                                                        ? "rgba(59,130,246,0.2)"
                                                        : "rgba(16,185,129,0.2)"
                                                    }`,
                                                borderBottomLeftRadius: isCustomer ? "4px" : "16px",
                                                borderBottomRightRadius: isCustomer ? "16px" : "4px",
                                            }}
                                        >
                                            {isAI && (
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Bot className="w-3 h-3" style={{ color: "var(--accent-blue)" }} />
                                                    <span className="text-[10px] font-medium" style={{ color: "var(--accent-blue)" }}>
                                                        AI Response
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-primary)" }}>
                                                {msg.text}
                                            </p>
                                            <div className="flex items-center justify-end gap-2 mt-2">
                                                {msg.sentiment && (
                                                    <span className="text-[10px]">
                                                        {msg.sentiment === "positive" ? "😊" : msg.sentiment === "neutral" ? "😐" : "😞"}
                                                    </span>
                                                )}
                                                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                                                    {format(new Date(msg.createdAt), "hh:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Compose */}
                        <div
                            className="px-6 py-4 flex-shrink-0"
                            style={{
                                borderTop: "1px solid var(--border-subtle)",
                                background: "var(--bg-secondary)",
                            }}
                        >
                            <div className="text-xs text-zinc-500 mb-2 italic">
                                Tip: Start with <span className="text-blue-400 font-mono">!sim </span> to simulate an incoming customer message.
                            </div>
                            <div
                                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                style={{
                                    background: "var(--bg-primary)",
                                    border: "1px solid var(--border-subtle)",
                                }}
                            >
                                <button style={{ color: "var(--text-muted)" }}>
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSend();
                                    }}
                                    disabled={isSending}
                                    className="flex-1 bg-transparent text-sm outline-none"
                                    style={{ color: "var(--text-primary)" }}
                                />
                                <button style={{ color: "var(--text-muted)" }}>
                                    <Smile className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="p-2 rounded-lg transition-colors duration-200"
                                    style={{ background: "var(--gradient-hero)", color: "white", opacity: isSending ? 0.7 : 1 }}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-zinc-500">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
