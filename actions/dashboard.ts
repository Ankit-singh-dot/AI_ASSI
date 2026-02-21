"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getDashboardData() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    // Fetch metrics data
    const totalLeads = await prisma.lead.count({
        where: { conversations: { some: { userId: dbUser.id } } },
    });

    const conversations = await prisma.conversation.count({
        where: { userId: dbUser.id },
    });

    const meetingsBooked = await prisma.activity.count({
        where: { userId: dbUser.id, title: "Meeting Booked" },
    });

    // Fetch feed (Latest Activities)
    const feed = await prisma.activity.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    // Fetch tasks
    const tasks = await prisma.task.findMany({
        where: { userId: dbUser.id, completed: false },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    return {
        metrics: {
            totalLeads,
            conversations,
            meetingsBooked,
            responseRate: "98.2%", // Mocked for now
            avgResponseTime: "1m 42s", // Mocked for now
        },
        feed,
        tasks,
        user: dbUser,
    };
}
