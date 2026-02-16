"use client";

import {
    Users,
    Clock,
    CalendarCheck,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Bot,
    MessageSquare,
    Zap,
    AlertTriangle,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock3
} from "lucide-react";

// Mock Data
const metrics = [
    { label: "Total Leads", value: "1,248", change: "+12.5%", trend: "up", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Response Rate", value: "98.2%", change: "+2.1%", trend: "up", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Meetings Booked", value: "42", change: "+8", trend: "up", icon: CalendarCheck, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Avg. Response Time", value: "1m 42s", change: "-12s", trend: "down", icon: Clock, color: "text-purple-400", bg: "bg-purple-400/10" },
];

const feed = [
    { id: 1, user: "Amit Varma", time: "2m ago", action: "Replied check pricing", status: "Hot", channel: "WhatsApp" },
    { id: 2, user: "Sneha Gupta", time: "15m ago", action: "Booked a demo for tmrw", status: "Converted", channel: "Web" },
    { id: 3, user: "Rahul K.", time: "42m ago", action: "Requested callback", status: "Pending", channel: "Email" },
    { id: 4, user: "Priya Singh", time: "1h ago", action: "AI clarified pricing", status: "Nurturing", channel: "WhatsApp" },
];

const tasks = [
    { id: 1, text: "Review 3 flagged conversations", priority: "High", due: "Today" },
    { id: 2, text: "Approve 2 email campaigns", priority: "Medium", due: "Tomorrow" },
    { id: 3, text: "Connect LinkedIn integration", priority: "Low", due: "This week" },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-fade">
            {/* Welcome Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Good afternoon, Rahul</h1>
                    <p className="text-zinc-400 text-sm mt-1">Here's what's happening in your workspace today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                        + New Campaign
                    </button>
                </div>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                    <div key={m.label} className="group relative p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${m.bg} ${m.color}`}>
                                <m.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${m.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                                {m.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {m.change}
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white tracking-tight">{m.value}</div>
                            <div className="text-zinc-500 text-xs font-medium mt-1">{m.label}</div>
                        </div>

                        {/* Decorative gradient blob */}
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:from-white/10 transition-colors pointer-events-none" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Intelligence Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400" />
                            Live Activity Feed
                        </h3>
                        <button className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
                    </div>

                    <div className="border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
                        {feed.map((item, i) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
                                    {item.user.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-medium text-zinc-200">{item.user}</span>
                                        <span className="text-[10px] text-zinc-500">{item.time}</span>
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate">{item.action}</div>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-medium border ${item.status === 'Hot' ? 'border-red-500/20 text-red-400' :
                                            item.status === 'Converted' ? 'border-emerald-500/20 text-emerald-400' :
                                                'border-zinc-700 text-zinc-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Rail: AI Insights & Tasks */}
                <div className="space-y-6">
                    {/* AI Summary Card */}
                    <div className="p-5 rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Bot className="w-16 h-16 text-indigo-500 rotate-12" />
                        </div>
                        <h3 className="text-sm font-semibold text-indigo-100 mb-2 flex items-center gap-2">
                            <Bot className="w-4 h-4" /> AI Daily Brief
                        </h3>
                        <p className="text-xs text-indigo-200/80 leading-relaxed">
                            You have <span className="font-semibold text-white">3 urgent leads</span> waiting for approval.
                            Campaign "Summer Sale" is performing 14% better than average.
                        </p>
                        <button className="mt-3 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-lg text-xs font-medium text-indigo-200 transition-colors">
                            Review Insights
                        </button>
                    </div>

                    {/* Tasks List */}
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Priority Tasks
                        </h3>
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <div key={task.id} className="p-3 rounded-lg border border-white/5 bg-zinc-900/50 hover:border-zinc-700 transition-colors flex items-start gap-3 group">
                                    <div className="mt-0.5">
                                        <div className="w-4 h-4 rounded-full border border-zinc-600 group-hover:border-emerald-500 transition-colors cursor-pointer" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-zinc-300 group-hover:text-white transition-colors leading-snug">{task.text}</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-500/10 text-red-400' :
                                                    task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                                                <Clock3 className="w-3 h-3" /> {task.due}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
