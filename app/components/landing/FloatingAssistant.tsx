"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, Bot, Sparkles, Sheet, Variable, ArrowRight } from "lucide-react";

export default function FloatingAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi there! I'm your AI guide. How can I help you get started with FlowAI today?" }
    ]);
    const [input, setInput] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const suggestedQuestions = [
        { icon: <Variable className="w-4 h-4" />, text: "How do I use variables?" },
        { icon: <Sheet className="w-4 h-4" />, text: "How to add a Google Sheet?" },
        { icon: <ArrowRight className="w-4 h-4" />, text: "What's the next step to proceed?" },
    ];

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', text }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/v1/ai/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!res.ok) {
                throw new Error("Failed to connect to AI");
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-sm">FlowAI Guide</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-zinc-400 text-[10px] uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-white transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-5 pb-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-white text-black rounded-br-sm'
                                            : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {messages.length === 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="px-2 mt-4"
                                >
                                    <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">Suggested Questions</p>
                                    <div className="flex flex-col gap-2">
                                        {suggestedQuestions.map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(q.text)}
                                                className="flex items-center gap-3 text-left w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all text-sm text-zinc-300 hover:text-white"
                                            >
                                                <div className="text-zinc-400">{q.icon}</div>
                                                {q.text}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-[#050505]">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                                    placeholder="Ask about variables, sheets..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-500"
                                />
                                <button
                                    onClick={() => handleSend(input)}
                                    className={`absolute right-1.5 p-2 rounded-full transition-all ${input.trim() || isLoading ? 'bg-white text-black hover:scale-105' : 'bg-transparent text-zinc-600'
                                        }`}
                                    disabled={!input.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center w-14 h-14 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-shadow"
            >
                <div className="absolute inset-0 rounded-full border border-white/20 scale-[1.15] opacity-0 group-hover:opacity-100 group-hover:scale-[1.25] transition-all duration-500"></div>
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}

                {/* Notification Dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-black rounded-full animate-bounce"></span>
                )}
            </motion.button>
        </div >
    );
}
