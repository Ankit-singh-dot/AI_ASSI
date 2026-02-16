"use client";

import { useState } from "react";
import { Search, Phone, Mail, MessageSquare, Send, Paperclip, Smile, MoreHorizontal, Bot } from "lucide-react";

type Conversation = {
    id: number;
    name: string;
    avatar: string;
    channel: "whatsapp" | "email";
    lastMessage: string;
    time: string;
    unread: number;
    score: number;
    sentiment: "positive" | "neutral" | "negative";
};

type Message = {
    id: number;
    sender: "customer" | "ai" | "agent";
    text: string;
    time: string;
    sentiment?: "positive" | "neutral" | "negative";
};

const conversations: Conversation[] = [
    { id: 1, name: "Priya Sharma", avatar: "PS", channel: "whatsapp", lastMessage: "What are your software prices?", time: "2m ago", unread: 2, score: 92, sentiment: "positive" },
    { id: 2, name: "Vikram Patel", avatar: "VP", channel: "email", lastMessage: "RE: Demo Request — looking forward to it", time: "8m ago", unread: 0, score: 78, sentiment: "neutral" },
    { id: 3, name: "Meera Joshi", avatar: "MJ", channel: "whatsapp", lastMessage: "Can we schedule a call this week?", time: "15m ago", unread: 1, score: 85, sentiment: "positive" },
    { id: 4, name: "Rajesh Kumar", avatar: "RK", channel: "email", lastMessage: "I'm not sure if this is the right fit...", time: "32m ago", unread: 0, score: 67, sentiment: "neutral" },
    { id: 5, name: "Anita Desai", avatar: "AD", channel: "whatsapp", lastMessage: "This is really frustrating!", time: "1h ago", unread: 3, score: 45, sentiment: "negative" },
    { id: 6, name: "Suresh Nair", avatar: "SN", channel: "email", lastMessage: "Thanks for the quick response!", time: "1.5h ago", unread: 0, score: 60, sentiment: "positive" },
];

const messagesByConvo: Record<number, Message[]> = {
    1: [
        { id: 1, sender: "customer", text: "Hi, I saw your ad on Instagram. What are your software prices?", time: "10:42 AM", sentiment: "neutral" },
        { id: 2, sender: "ai", text: "Hi Priya! Thanks for your interest in FlowAI. Our pricing starts at ₹999/month for the Starter plan. Would you like to schedule a quick 15-min demo to see how it can help your retail business?", time: "10:42 AM" },
        { id: 3, sender: "customer", text: "Yes, I'd love a demo. What times are available?", time: "10:45 AM", sentiment: "positive" },
        { id: 4, sender: "ai", text: "Great! Here are the available slots for this week:\n\n📅 Tomorrow (Tue) — 10:00 AM, 2:00 PM\n📅 Wednesday — 11:00 AM, 3:00 PM\n📅 Thursday — 10:00 AM\n\nWhich time works best for you?", time: "10:45 AM" },
        { id: 5, sender: "customer", text: "Tomorrow 2 PM works perfectly!", time: "10:48 AM", sentiment: "positive" },
    ],
};

const channelIcon = { whatsapp: MessageSquare, email: Mail };
const channelColor = { whatsapp: "#25D366", email: "#EA4335" };

export default function ConversationsPage() {
    const [activeConvo, setActiveConvo] = useState<number>(1);
    const active = conversations.find((c) => c.id === activeConvo)!;
    const messages = messagesByConvo[activeConvo] || [];

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
                    {conversations.map((convo) => {
                        const ChannelIcon = channelIcon[convo.channel];
                        const cColor = channelColor[convo.channel];
                        const isActive = activeConvo === convo.id;
                        return (
                            <button
                                key={convo.id}
                                onClick={() => setActiveConvo(convo.id)}
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
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ background: "var(--gradient-hero)", color: "white" }}
                                    >
                                        {convo.avatar}
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
                                            {convo.name}
                                        </span>
                                        <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                            {convo.time}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                            {convo.lastMessage}
                                        </p>
                                        {convo.unread > 0 && (
                                            <span
                                                className="ml-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                                style={{ background: "var(--accent-blue)", color: "white" }}
                                            >
                                                {convo.unread}
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
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: "var(--gradient-hero)", color: "white" }}
                        >
                            {active.avatar}
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                {active.name}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: channelColor[active.channel] }}>
                                    {active.channel === "whatsapp" ? "WhatsApp" : "Email"}
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
                    {messages.map((msg) => {
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
                                            {msg.time}
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
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: "var(--text-primary)" }}
                        />
                        <button style={{ color: "var(--text-muted)" }}>
                            <Smile className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2 rounded-lg transition-colors duration-200"
                            style={{ background: "var(--gradient-hero)", color: "white" }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
