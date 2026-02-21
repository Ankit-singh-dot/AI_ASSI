"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function getAutomations() {
    const dbUser = await getDbUser();

    return prisma.automation.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { automationRuns: true } },
        },
    });
}

export async function createAutomation(data: {
    name: string;
    description?: string;
    trigger: string;
    action: string;
    icon?: string;
    color?: string;
    active?: boolean;
}) {
    const dbUser = await getDbUser();

    const automation = await prisma.automation.create({
        data: {
            userId: dbUser.id,
            name: data.name,
            description: data.description || null,
            trigger: data.trigger,
            action: data.action,
            icon: data.icon || "Zap",
            color: data.color || "#3b82f6",
            active: data.active !== undefined ? data.active : true,
        },
    });

    revalidatePath("/dashboard/automations");
    return automation;
}

export async function toggleAutomation(automationId: string) {
    const dbUser = await getDbUser();

    const automation = await prisma.automation.findFirst({
        where: { id: automationId, userId: dbUser.id },
    });

    if (!automation) throw new Error("Automation not found");

    const updated = await prisma.automation.update({
        where: { id: automationId },
        data: { active: !automation.active },
    });

    revalidatePath("/dashboard/automations");
    return updated;
}

export async function deleteAutomation(automationId: string) {
    const dbUser = await getDbUser();

    await prisma.automation.delete({
        where: { id: automationId, userId: dbUser.id },
    });

    revalidatePath("/dashboard/automations");
}

export async function seedDefaultAutomations() {
    const dbUser = await getDbUser();

    // Only seed if user has zero automations
    const count = await prisma.automation.count({ where: { userId: dbUser.id } });
    if (count > 0) return;

    const defaults = [
        {
            name: "Auto-respond to new WhatsApp leads",
            description: "Send a personalized AI response within 3 seconds of receiving a new WhatsApp message.",
            trigger: "New WhatsApp message",
            action: "AI Auto-response",
            icon: "MessageSquare",
            color: "#25D366",
        },
        {
            name: "Follow up after 24 hours",
            description: "Automatically send a follow-up message if the lead hasn't responded within 24 hours.",
            trigger: "No response in 24h",
            action: "Send Follow-up",
            icon: "Clock",
            color: "#f59e0b",
        },
        {
            name: "Book demo with qualified leads",
            description: "When a lead scores above 80, automatically send a calendar booking link.",
            trigger: "Lead score > 80",
            action: "Send Booking Link",
            icon: "Calendar",
            color: "#8b5cf6",
        },
        {
            name: "Email nurture for cold leads",
            description: "Send a weekly email digest with case studies and offers to leads scoring below 50.",
            trigger: "Lead score < 50",
            action: "Email Sequence",
            icon: "Mail",
            color: "#EA4335",
        },
        {
            name: "Negative sentiment alert",
            description: "Immediately notify the team lead when negative sentiment is detected in a conversation.",
            trigger: "Sentiment = Negative",
            action: "Send Alert",
            icon: "Zap",
            color: "#ef4444",
        },
    ];

    await prisma.automation.createMany({
        data: defaults.map((d) => ({
            userId: dbUser.id,
            ...d,
        })),
    });

    revalidatePath("/dashboard/automations");
}
