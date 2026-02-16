"use client";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";

const funnelData = [
    { stage: "Leads", value: 487, fill: "#3b82f6" },
    { stage: "Contacted", value: 342, fill: "#8b5cf6" },
    { stage: "Qualified", value: 198, fill: "#06b6d4" },
    { stage: "Converted", value: 87, fill: "#10b981" },
];

const sourceData = [
    { name: "WhatsApp", value: 42, fill: "#25D366" },
    { name: "Email", value: 32, fill: "#EA4335" },
    { name: "Web Forms", value: 18, fill: "#06b6d4" },
    { name: "Manual", value: 8, fill: "#8b5cf6" },
];

const responseTrend = [
    { date: "Mon", avgTime: 45, leads: 12 },
    { date: "Tue", avgTime: 30, leads: 18 },
    { date: "Wed", avgTime: 20, leads: 24 },
    { date: "Thu", avgTime: 15, leads: 20 },
    { date: "Fri", avgTime: 8, leads: 30 },
    { date: "Sat", avgTime: 5, leads: 16 },
    { date: "Sun", avgTime: 3, leads: 10 },
];

const sentimentTrend = [
    { date: "Week 1", positive: 55, neutral: 30, negative: 15 },
    { date: "Week 2", positive: 60, neutral: 28, negative: 12 },
    { date: "Week 3", positive: 62, neutral: 25, negative: 13 },
    { date: "Week 4", positive: 68, neutral: 25, negative: 7 },
];

const topTemplates = [
    { name: "Pricing Inquiry Response", sent: 145, responseRate: 78, conversion: 34 },
    { name: "Demo Booking Invitation", sent: 98, responseRate: 65, conversion: 42 },
    { name: "Follow-up Day 1", sent: 210, responseRate: 45, conversion: 18 },
    { name: "Initial Acknowledgment", sent: 320, responseRate: 82, conversion: 12 },
    { name: "After-Hours Message", sent: 78, responseRate: 55, conversion: 22 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload) return null;
    return (
        <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}
        >
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                {label}
            </p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }}>
                    {entry.name}: {entry.value}
                </p>
            ))}
        </div>
    );
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Analytics
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Performance insights and trends for the last 30 days.
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Leads", value: "487", change: "+23%", color: "#3b82f6" },
                    { label: "Avg Response Time", value: "3.2s", change: "-85%", color: "#10b981" },
                    { label: "Conversion Rate", value: "17.9%", change: "+4.2%", color: "#8b5cf6" },
                    { label: "Revenue Impact", value: "₹4.2L", change: "+31%", color: "#f59e0b" },
                ].map((s) => (
                    <div key={s.label} className="glass-card p-5">
                        <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: s.color }}>{s.change}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Conversion Funnel
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={funnelData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                            <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                            <YAxis dataKey="stage" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} width={80} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                {funnelData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Lead Sources Pie */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Lead Sources
                    </h3>
                    <div className="flex items-center gap-8">
                        <ResponsiveContainer width="50%" height={220}>
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {sourceData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                            {sourceData.map((s) => (
                                <div key={s.name} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ background: s.fill }} />
                                    <div>
                                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.name}</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.value}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Response Time Trend */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Response Time Trend (seconds)
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={responseTrend}>
                            <defs>
                                <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="avgTime" stroke="#3b82f6" fill="url(#responseGrad)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Sentiment Trend */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Sentiment Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={sentimentTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
                            <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Templates Table */}
            <div className="glass-card-static p-5">
                <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                    Top Performing Templates
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                {["Template", "Sent", "Response Rate", "Conversion"].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topTemplates.map((t) => (
                                <tr key={t.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                        {t.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {t.sent}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${t.responseRate}%`,
                                                        background: t.responseRate > 70 ? "#10b981" : t.responseRate > 50 ? "#f59e0b" : "#ef4444",
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                                {t.responseRate}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="text-xs px-2 py-1 rounded-full font-medium"
                                            style={{
                                                background: t.conversion > 30 ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)",
                                                color: t.conversion > 30 ? "#10b981" : "#3b82f6",
                                            }}
                                        >
                                            {t.conversion}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
