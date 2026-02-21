"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { generateAutoResponse } from "@/lib/ai/gemini";

export async function generateOutreachMessage(
    leadId: string,
    channel: string,
    tone: string
) {
    const dbUser = await getDbUser();

    const lead = await prisma.lead.findFirst({
        where: { id: leadId, userId: dbUser.id },
        include: {
            conversations: {
                include: { messages: { orderBy: { createdAt: "desc" }, take: 5 } },
                take: 1,
            },
        },
    });

    if (!lead) throw new Error("Lead not found");

    // Build context from lead data and conversation history
    const conversationHistory = lead.conversations?.[0]?.messages?.map((m) => ({
        role: m.sender === "customer" ? "user" : "model",
        content: m.text,
    })) || [];

    const outreachPrompt = `Write a ${tone} outreach message to ${lead.name} via ${channel}. 
Their email is ${lead.email || "unknown"}, their score is ${lead.score}/100, sentiment: ${lead.sentiment}.
Status: ${lead.status}. Tags: ${lead.tags.join(", ") || "none"}.
Keep it under 4 sentences. Be natural, not robotic. Include a clear call-to-action.
${tone === "urgent" ? "Make it feel time-sensitive." : ""}
${tone === "casual" ? "Use a friendly, warm tone with 1-2 emojis." : ""}
${tone === "formal" ? "Use professional business language." : ""}
Do NOT include subject lines or labels. Just the message body.`;

    const message = await generateAutoResponse(
        dbUser,
        conversationHistory,
        outreachPrompt
    );

    return {
        message,
        lead: { name: lead.name, email: lead.email, phone: lead.phone, source: lead.source },
    };
}
