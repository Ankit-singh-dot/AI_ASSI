"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function getQuickReplies() {
    const dbUser = await getDbUser();

    // Seed defaults if first visit
    const count = await prisma.quickReply.count({ where: { userId: dbUser.id } });
    if (count === 0) {
        const defaults = [
            { title: "Welcome Greeting", body: "Hi there! 👋 Thanks for reaching out to us. How can I help you today?", category: "greeting" },
            { title: "Pricing Inquiry", body: "Great question! Our pricing depends on your specific needs. Would you like to schedule a quick call so I can understand your requirements and share the best plan?", category: "pricing" },
            { title: "Meeting Link", body: "I'd love to chat more about this! Here's my calendar link to book a time that works for you: [Insert Calendar Link]", category: "follow-up" },
            { title: "Follow-Up", body: "Hi! Just checking in on our previous conversation. Do you have any questions or would you like to move forward?", category: "follow-up" },
            { title: "Thank You", body: "Thanks so much for choosing us! We're excited to work with you. If you need anything at all, don't hesitate to reach out. 🙌", category: "closing" },
            { title: "Not Available", body: "Thanks for your message! Our team is currently offline but we'll get back to you first thing tomorrow morning. 🕐", category: "general" },
        ];

        await prisma.quickReply.createMany({
            data: defaults.map((d) => ({ userId: dbUser.id, ...d })),
        });
    }

    return prisma.quickReply.findMany({
        where: { userId: dbUser.id },
        orderBy: { usageCount: "desc" },
    });
}

export async function createQuickReply(data: {
    title: string;
    body: string;
    category?: string;
}) {
    const dbUser = await getDbUser();

    const reply = await prisma.quickReply.create({
        data: {
            userId: dbUser.id,
            title: data.title,
            body: data.body,
            category: data.category || "general",
        },
    });

    revalidatePath("/dashboard/templates");
    return reply;
}

export async function deleteQuickReply(replyId: string) {
    const dbUser = await getDbUser();

    await prisma.quickReply.delete({
        where: { id: replyId, userId: dbUser.id },
    });

    revalidatePath("/dashboard/templates");
}

export async function useQuickReply(replyId: string) {
    const dbUser = await getDbUser();

    const reply = await prisma.quickReply.update({
        where: { id: replyId, userId: dbUser.id },
        data: { usageCount: { increment: 1 } },
    });

    return reply;
}
