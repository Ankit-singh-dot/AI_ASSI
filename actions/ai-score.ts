"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeLeadScore(conversationId: string, overrideUserId?: string) {
    let userId = overrideUserId;
    if (!userId) {
        try {
            const dbUser = await getDbUser();
            userId = dbUser.id;
        } catch {
            console.error("No user context provided for AI scoring.");
            return;
        }
    }

    if (!apiKey) {
        console.warn("No GEMINI_API_KEY found. AI Scoring disabled.");
        return;
    }

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId: userId },
        include: {
            lead: true,
            messages: {
                orderBy: { createdAt: "asc" }
            }
        }
    });

    if (!conversation || !conversation.lead || conversation.messages.length === 0) {
        return;
    }

    // Format transcript
    const transcript = conversation.messages.map(m => {
        const speaker = m.sender === "agent" ? "Agent" : "Customer";
        return `${speaker}: ${m.text}`;
    }).join("\n");

    const prompt = `
    You are an expert CRM lead routing AI. 
    Analyze the following conversation between a Customer and an Agent/Business.
    
    Determine the customer's interest level, urgency, and purchase intent.
    Return ONLY a single integer from 0 to 100 representing the lead score.
    
    Scoring Guide:
    0-20: Spam, completely uninterested, wrong number.
    21-40: Just browsing, very low intent.
    41-60: Asking general questions, mildly interested.
    61-80: High intent, asking about pricing, specific services, or availability.
    81-100: Ready to buy, extremely urgent, asking how to pay or book immediately.
    
    Conversation Transcript:
    ${transcript}
    
    Score (0-100):`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Extract the integer
        const match = responseText.match(/\d+/);
        if (match) {
            let score = parseInt(match[0], 10);
            if (score < 0) score = 0;
            if (score > 100) score = 100;

            // Update the lead's score
            await prisma.lead.update({
                where: { id: conversation.lead.id },
                data: { score }
            });

            return score;
        } else {
            console.error("AI did not return a valid score:", responseText);
        }
    } catch (e) {
        console.error("Failed to analyze lead score:", e);
    }
}
