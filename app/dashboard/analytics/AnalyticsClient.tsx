"use client";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const FUNNEL_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"];
const SOURCE_COLORS: Record<string, string> = {
    Whatsapp: "#25D366",
    Email: "#EA4335",
    Website: "#06b6d4",
    Manual: "#8b5cf6",
};

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

export default function AnalyticsClient({ data }: { data: any }) {
    const { stats, funnelData, sourceData, sentimentCounts, automationStats } = data;

    const funnelWithColors = funnelData.map((item: any, i: number) => ({
        ...item,
        fill: FUNNEL_COLORS[i] || "#3b82f6",
    }));

    const sourceWithColors = sourceData.map((item: any) => ({
        ...item,
        fill: SOURCE_COLORS[item.name] || "#8b5cf6",
    }));

    const sentimentData = [
        { name: "Positive", value: sentimentCounts.positive, fill: "#10b981" },
        { name: "Neutral", value: sentimentCounts.neutral, fill: "#f59e0b" },
        { name: "Negative", value: sentimentCounts.negative, fill: "#ef4444" },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Analytics
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Performance insights for your pipeline.
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Leads", value: stats.totalLeads.toString(), change: "+23%", color: "#3b82f6" },
                    { label: "Avg Response Time", value: stats.avgResponseTime, change: "-85%", color: "#10b981" },
                    { label: "Conversion Rate", value: stats.conversionRate, change: "+4.2%", color: "#8b5cf6" },
                    { label: "Revenue Impact", value: stats.revenueImpact, change: "+31%", color: "#f59e0b" },
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
                    {funnelWithColors.every((f: any) => f.value === 0) ? (
                        <div className="h-[260px] flex items-center justify-center text-sm text-zinc-500">
                            No lead data yet. Add leads to see the funnel.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={funnelWithColors} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} />
                                <YAxis dataKey="stage" type="category" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                                    {funnelWithColors.map((entry: any, i: number) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Lead Sources Pie */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Lead Sources
                    </h3>
                    <div className="flex items-center gap-8">
                        {sourceWithColors.every((s: any) => s.value === 0) ? (
                            <div className="w-full h-[220px] flex items-center justify-center text-sm text-zinc-500">
                                No source data yet.
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="50%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={sourceWithColors}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {sourceWithColors.map((entry: any, i: number) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3">
                                    {sourceWithColors.map((s: any) => (
                                        <div key={s.name} className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ background: s.fill }} />
                                            <div>
                                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.name}</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.value}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Distribution */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Conversation Sentiment
                    </h3>
                    {sentimentData.every((s: any) => s.value === 0) ? (
                        <div className="h-[240px] flex items-center justify-center text-sm text-zinc-500">
                            No conversation data yet.
                        </div>
                    ) : (
                        <div className="flex items-center gap-8">
                            <ResponsiveContainer width="50%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {sentimentData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-3">
                                {sentimentData.map((s) => (
                                    <div key={s.name} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ background: s.fill }} />
                                        <div>
                                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.name}</p>
                                            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Automation Stats */}
                <div className="glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                        Automation Performance
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total Automation Runs</span>
                            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{automationStats.totalRuns}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Avg Success Rate</span>
                            <span className="text-2xl font-bold" style={{ color: "#10b981" }}>{automationStats.avgSuccessRate}%</span>
                        </div>
                        <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Automations save you hours every day by handling repetitive tasks like follow-ups, responses, and lead scoring.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
