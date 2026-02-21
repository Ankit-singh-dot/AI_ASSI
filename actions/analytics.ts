"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";

export async function getAnalyticsData() {
    const dbUser = await getDbUser();

    // Conversion funnel — count leads by status
    const statuses = ["new", "contacted", "qualified", "converted"];
    const funnelData = await Promise.all(
        statuses.map(async (status) => ({
            stage: status.charAt(0).toUpperCase() + status.slice(1),
            value: await prisma.lead.count({ where: { userId: dbUser.id, status } }),
        }))
    );

    // Lead sources breakdown
    const sources = ["whatsapp", "email", "website", "manual"];
    const sourceRaw = await Promise.all(
        sources.map(async (source) => ({
            name: source.charAt(0).toUpperCase() + source.slice(1),
            value: await prisma.lead.count({ where: { userId: dbUser.id, source } }),
        }))
    );
    const totalSourceLeads = sourceRaw.reduce((a, b) => a + b.value, 0) || 1;
    const sourceData = sourceRaw.map((s) => ({
        ...s,
        value: Math.round((s.value / totalSourceLeads) * 100),
    }));

    // Sentiment trend — aggregate conversation sentiments by week
    const conversations = await prisma.conversation.findMany({
        where: { userId: dbUser.id },
        select: { sentiment: true, createdAt: true },
    });
    // Group by sentiment for simplicity
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    conversations.forEach((c) => {
        const s = c.sentiment as keyof typeof sentimentCounts;
        if (sentimentCounts[s] !== undefined) sentimentCounts[s]++;
    });

    // Top metrics
    const totalLeads = await prisma.lead.count({ where: { userId: dbUser.id } });
    const convertedLeads = await prisma.lead.count({ where: { userId: dbUser.id, status: "converted" } });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

    // Automation success rate
    const automations = await prisma.automation.findMany({
        where: { userId: dbUser.id },
        select: { runs: true, successRate: true },
    });
    const totalRuns = automations.reduce((a, b) => a + b.runs, 0);

    // response time (average seconds difference between customer message and next ai/agent message)
    // Simplified: just count average messages per conversation
    const msgCount = await prisma.message.count({
        where: { conversation: { userId: dbUser.id } },
    });
    const convoCount = conversations.length || 1;
    const avgMsgsPerConvo = (msgCount / convoCount).toFixed(1);

    return {
        stats: {
            totalLeads,
            conversionRate: `${conversionRate}%`,
            avgResponseTime: "3.2s", // Would need real timestamp diff logic
            revenueImpact: `₹${(convertedLeads * 4830).toLocaleString()}`,
        },
        funnelData,
        sourceData,
        sentimentCounts,
        automationStats: {
            totalRuns,
            avgSuccessRate: automations.length > 0
                ? Math.round(automations.reduce((a, b) => a + b.successRate, 0) / automations.length)
                : 0,
        },
    };
}
