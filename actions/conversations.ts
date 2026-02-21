"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { analyzeLeadMessage, generateAutoResponse } from "@/lib/ai/gemini";

export async function getConversations() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    return prisma.conversation.findMany({
        where: { userId: dbUser.id },
        include: {
            lead: true,
            messages: {
                orderBy: { createdAt: "asc" },
            },
        },
        orderBy: { updatedAt: "desc" },
    });
}

export async function sendMessage(conversationId: string, text: string, sender: "agent" | "ai" = "agent") {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const message = await prisma.message.create({
        data: {
            conversationId,
            text,
            sender,
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    revalidatePath("/dashboard/conversations");
    return message;
}

/**
 * Simulates receiving a message from a customer.
 * This triggers the AI pipeline:
 * 1. Store the customer message.
 * 2. Analyze intent and sentiment.
 * 3. Update Conversation score/sentiment.
 * 4. Generate AI auto-response if applicable.
 */
export async function simulateCustomerMessage(conversationId: string, text: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) throw new Error("User not found in database");

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            messages: true,
        },
    });

    if (!conversation) throw new Error("Conversation not found");

    // 1. Save Customer Message
    await prisma.message.create({
        data: {
            conversationId,
            text,
            sender: "customer",
        },
    });

    // 2. Analyze Lead Message
    const analysis = await analyzeLeadMessage(text);

    // 3. Update Conversation with AI Analysis
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            sentiment: analysis.sentiment,
            score: analysis.leadScore,
            unreadCount: conversation.unreadCount + 1,
            updatedAt: new Date(),
        },
    });

    // Revalidate to show customer message immediately
    revalidatePath("/dashboard/conversations");

    // 4. Generate Auto Response asynchronously (or await it depending on UX needs)
    // Here we wait for it so the UI can refresh with the AI response
    const history = conversation.messages.map((m) => ({
        role: m.sender,
        content: m.text,
    }));

    const aiResponseText = await generateAutoResponse(dbUser, history, text);

    await prisma.message.create({
        data: {
            conversationId,
            text: aiResponseText,
            sender: "ai",
            sentiment: "neutral", // AI is usually neutral
        },
    });

    // Optionally log the activity
    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: "AI Auto-replied",
            channel: conversation.channel,
            status: "Replied",
            description: `Intent detected: ${analysis.intent}`,
        },
    });

    revalidatePath("/dashboard/conversations");
    revalidatePath("/dashboard");
}
