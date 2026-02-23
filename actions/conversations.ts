"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { analyzeLeadScore } from "./ai-score";

export async function getConversations() {
    const dbUser = await getDbUser();

    return prisma.conversation.findMany({
        where: { userId: dbUser.id },
        include: {
            lead: true,
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1, // Get the last message for the preview
            }
        },
        orderBy: { updatedAt: "desc" },
    });
}

export async function getConversation(conversationId: string) {
    const dbUser = await getDbUser();

    // Mark as read
    await prisma.conversation.updateMany({
        where: { id: conversationId, userId: dbUser.id },
        data: { unreadCount: 0 }
    });

    return prisma.conversation.findFirst({
        where: { id: conversationId, userId: dbUser.id },
        include: {
            lead: true,
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });
}

export async function sendReply(conversationId: string, text: string) {
    const dbUser = await getDbUser();

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: dbUser.id },
        include: { lead: true }
    });

    if (!conversation) throw new Error("Conversation not found");

    // 1. Save message to DB
    const message = await prisma.message.create({
        data: {
            conversationId,
            sender: "agent",
            text,
        }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date(), status: "Replied" }
    });

    // 2. Transmit via actual API 
    try {
        if (conversation.channel === "whatsapp") {
            // Find whatsapp integration
            const integration = await prisma.integration.findFirst({
                where: { userId: dbUser.id, platform: "whatsapp", status: "connected" }
            });

            if (integration && integration.apiKey) {
                const meta = integration.metadata as any;
                const phoneId = meta?.phoneNumberId;

                if (phoneId) {
                    const apiRes = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${integration.apiKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            messaging_product: "whatsapp",
                            recipient_type: "individual",
                            to: conversation.lead.phone, // Assuming leads.phone has the user's WA ID
                            type: "text",
                            text: { body: text }
                        })
                    });

                    const data = await apiRes.json();
                    if (!apiRes.ok) {
                        console.error("WhatsApp API Error:", data);
                        throw new Error(data.error?.message || "WhatsApp API rejected the message.");
                    }
                } else {
                    throw new Error("Phone Number ID missing from configuration.");
                }
            } else {
                throw new Error("WhatsApp integration not configured or missing API key.");
            }
        } else if (conversation.channel === "instagram") {
            const integration = await prisma.integration.findFirst({
                where: { userId: dbUser.id, platform: "instagram", status: "connected" }
            });

            if (integration && integration.apiKey) {
                const meta = integration.metadata as any;
                const pageId = meta?.pageId;

                if (pageId) {
                    const apiRes = await fetch(`https://graph.facebook.com/v22.0/${pageId}/messages`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${integration.apiKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            recipient: { id: conversation.lead.phone }, // Assuming leads.phone contains the IG Scoped ID
                            message: { text: text }
                        })
                    });

                    const data = await apiRes.json();
                    if (!apiRes.ok) {
                        console.error("Instagram API Error:", data);
                        throw new Error(data.error?.message || "Instagram API rejected the message.");
                    }
                } else {
                    throw new Error("Page ID missing from configuration.");
                }
            } else {
                throw new Error("Instagram integration not configured or missing API key.");
            }
        }
    } catch (e: any) {
        console.error("Failed to transmit message", e);
        // Rollback the message creation if API failed
        await prisma.message.delete({ where: { id: message.id } });
        throw new Error(e.message || "Failed to send message via platform API");
    }

    // --- 3. Async AI Scoring Update --- //
    analyzeLeadScore(conversation.id, dbUser.id).catch(err => {
        console.error("Async AI Scoring failed:", err);
    });

    revalidatePath("/dashboard/conversations");
    return message;
}
