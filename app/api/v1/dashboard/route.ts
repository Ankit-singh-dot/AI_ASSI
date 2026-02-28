import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
    try {
        console.log("--- DASHBOARD API HIT ---");
        const { userId: clerkId } = await auth();
        console.log("Clerk Token Extracted ID:", clerkId);

        if (!clerkId) {
            console.log("Returning 401 Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // KPIs
        const totalLeads = await prisma.lead.count({ where: { userId: user.id } });

        // Total Converted Leads
        const convertedLeads = await prisma.lead.count({
            where: { userId: user.id, status: "converted" }
        });

        const conversionRate = totalLeads > 0
            ? Math.round((convertedLeads / totalLeads) * 100 * 10) / 10
            : 0;

        const activeConversations = await prisma.conversation.count({
            where: { userId: user.id, status: "Active" }
        });

        const recentActivities = await prisma.activity.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const activities = recentActivities.map(a => ({
            id: a.id,
            type: "ACTIVITY",
            message: a.title,
            timestamp: a.createdAt.toLocaleDateString()
        }));

        if (activities.length === 0) {
            activities.push(
                { id: "f1", type: "SYSTEM", message: "Account created", timestamp: "Recently" }
            );
        }

        // Chart Data
        const chartData = {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            data: [10, 25, 18, 40, 50, 23, 30]
        };

        return NextResponse.json({
            kpis: {
                totalLeads,
                conversionRate,
                activeConversations
            },
            chartData,
            activities
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
