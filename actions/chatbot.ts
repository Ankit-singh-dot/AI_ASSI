"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppText, sendWhatsAppButtons } from "@/lib/whatsapp-sender";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");


async function getWhatsAppCredentials(userId: string) {
    const integration = await prisma.integration.findFirst({
        where: { userId, platform: "whatsapp", status: "connected" },
    });

    if (!integration || !integration.apiKey) return null;

    const meta = integration.metadata as any;
    return {
        apiKey: integration.apiKey,
        phoneNumberId: meta?.phoneNumberId as string | undefined,
    };
}

// ------------------------------------------------------------------ //
//  Helper: Save an AI message to the conversation                    //
// ------------------------------------------------------------------ //
async function saveAiMessage(conversationId: string, text: string) {
    await prisma.message.create({
        data: {
            conversationId,
            sender: "ai",
            text,
        },
    });
}

// ------------------------------------------------------------------ //
//  initChatbotFlow — called when a NEW conversation is created       //
// ------------------------------------------------------------------ //
export async function initChatbotFlow(
    conversationId: string,
    userId: string,
    platform: string
) {
    // Only auto-respond on WhatsApp for now
    if (platform !== "whatsapp") return;

    const creds = await getWhatsAppCredentials(userId);
    if (!creds || !creds.phoneNumberId) return;

    // Get the conversation to find the lead's phone
    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId },
        include: { lead: true },
    });
    if (!conversation || !conversation.lead?.phone) return;

    const to = conversation.lead.phone;

    // Set botPhase to language_select
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { botPhase: "language_select" } as any,
    });

    // Send language selection buttons
    const greeting =
        "👋 Welcome! Please choose your preferred language:\n\nकृपया अपनी भाषा चुनें:";

    try {
        await sendWhatsAppButtons(
            creds.apiKey,
            creds.phoneNumberId,
            to,
            greeting,
            [
                { id: "lang_en", title: "🇬🇧 English" },
                { id: "lang_hi", title: "🇮🇳 हिंदी" },
            ]
        );
        await saveAiMessage(conversationId, greeting);
    } catch (err) {
        console.error("Failed to send language selection:", err);
        // Fallback to plain text if buttons fail
        const fallbackText =
            "👋 Welcome! Please reply:\n1️⃣ for English\n2️⃣ हिंदी के लिए";
        try {
            await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, fallbackText);
            await saveAiMessage(conversationId, fallbackText);
        } catch (e) {
            console.error("Fallback text also failed:", e);
        }
    }
}

// ------------------------------------------------------------------ //
//  handleChatbotResponse — main auto-response handler                //
// ------------------------------------------------------------------ //
export async function handleChatbotResponse(
    conversationId: string,
    userId: string,
    customerMessage: string,
    platform: string
) {
    if (platform !== "whatsapp") return;

    const creds = await getWhatsAppCredentials(userId);
    if (!creds || !creds.phoneNumberId) return;

    const whatsapp = { apiKey: creds.apiKey, phoneNumberId: creds.phoneNumberId };

    const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId },
        include: {
            lead: true,
            messages: { orderBy: { createdAt: "asc" }, take: 20 },
        },
    });

    if (!conversation || !conversation.lead?.phone) return;

    const to = conversation.lead.phone;

    // ---- PHASE: Language Selection ---- //
    if ((conversation as any).botPhase === "language_select") {
        await handleLanguageSelection(
            conversationId,
            customerMessage,
            to,
            whatsapp,
            userId
        );
        return;
    }

    // ---- PHASE: AI Chat ---- //
    if ((conversation as any).botPhase === "ai_chat") {
        await handleAiChat(conversation, customerMessage, to, whatsapp, userId);
        return;
    }

    // If "handed_off" or "none" — do nothing, human agent handles
}

// ------------------------------------------------------------------ //
//  Language Selection Handler                                        //
// ------------------------------------------------------------------ //
async function handleLanguageSelection(
    conversationId: string,
    customerMessage: string,
    to: string,
    creds: { apiKey: string; phoneNumberId: string },
    userId: string
) {
    const msg = customerMessage.toLowerCase().trim();

    let language = "en";

    // Check for button reply IDs, text matches, or number selections
    if (
        msg === "lang_hi" ||
        msg.includes("हिंदी") ||
        msg.includes("hindi") ||
        msg === "2" ||
        msg === "2️⃣"
    ) {
        language = "hi";
    } else if (
        msg === "lang_en" ||
        msg.includes("english") ||
        msg === "1" ||
        msg === "1️⃣"
    ) {
        language = "en";
    } else {
        // Unrecognized — re-send the prompt
        const retryText =
            "Please reply:\n1️⃣ for English\n2️⃣ हिंदी के लिए";
        await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, retryText);
        await saveAiMessage(conversationId, retryText);
        return;
    }

    // Update conversation with language and move to ai_chat
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { language, botPhase: "ai_chat" } as any,
    });

    // Get user business profile for context
    const user = await prisma.user.findFirst({ where: { id: userId } });

    const greeting =
        language === "hi"
            ? `नमस्ते! 🙏 ${user?.businessName || "हमारी कंपनी"} में आपका स्वागत है। कृपया बताएं, हम आपकी कैसे मदद कर सकते हैं?`
            : `Hello! 👋 Welcome to ${user?.businessName || "our company"}. How can we help you today? Please tell us about your needs.`;

    await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, greeting);
    await saveAiMessage(conversationId, greeting);
}


async function handleAiChat(
    conversation: any,
    customerMessage: string,
    to: string,
    creds: { apiKey: string; phoneNumberId: string },
    userId: string
) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    const lang = conversation.language || "en";

    const languageInstruction =
        lang === "hi"
            ? "You MUST respond in Hindi using Devanagari script (हिंदी)."
            : "Respond in English.";

    const systemPrompt = `
You are a friendly and professional AI sales assistant for "${user?.businessName || "our company"}" in the ${user?.industry || "general"} industry.
${languageInstruction}

Your job is to understand the customer's business needs through natural conversation.
Ask about:
- What product/service they are interested in
- Their specific requirements or challenges
- Their approximate budget or timeline (be subtle, don't be pushy)
- Any other relevant details

Rules:
- Keep each response under 3 sentences. Be warm, helpful, and concise.
- Do NOT repeat questions the customer has already answered.
- Use 1-2 relevant emojis per message.
- If the customer has shared enough information (at least their need and one detail),
  OR if they explicitly ask to speak with a human/agent/person,
  OR if they seem frustrated or the conversation is going in circles,
  respond with EXACTLY the text [HANDOFF] and absolutely nothing else.
- Do NOT say "[HANDOFF]" in normal conversation. Only use it as the special signal.
`;

    // Build conversation history for Gemini
    const history = [
        { role: "user" as const, parts: [{ text: "SYSTEM: " + systemPrompt }] },
        {
            role: "model" as const,
            parts: [{ text: "Understood. I will act as the AI sales assistant." }],
        },
    ];

    // Add message history (skip the very last one, we'll send it via sendMessage)
    const messages = conversation.messages || [];
    for (const msg of messages) {
        if (msg.text === customerMessage && msg === messages[messages.length - 1]) continue;
        const role = msg.sender === "customer" ? "user" : "model";
        history.push({ role: role as "user" | "model", parts: [{ text: msg.text }] });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({ history: history as any });
        const result = await chat.sendMessage(customerMessage);
        let aiResponse = result.response.text().trim();

        // Check for handoff signal
        if (aiResponse.includes("[HANDOFF]")) {
            // Send acknowledgment message
            const handoffMsg =
                lang === "hi"
                    ? "🙏 धन्यवाद! हमने आपकी जानकारी प्राप्त कर ली है। हमारी टीम का एक सदस्य जल्द ही आपसे संपर्क करेगा। कृपया प्रतीक्षा करें!"
                    : "✅ Thank you for sharing your details! We've received your information. A team member will get in touch with you shortly. Have a great day! 🙏";

            await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, handoffMsg);
            await saveAiMessage(conversation.id, handoffMsg);

            // Update conversation to handed_off
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { botPhase: "handed_off", status: "Needs Attention" } as any,
            });

            // Log activity
            await prisma.activity.create({
                data: {
                    userId,
                    title: "AI Handoff — Human needed",
                    description: `Chatbot handed off conversation with ${conversation.lead?.name || "Unknown"} to human agent`,
                    channel: "whatsapp",
                },
            });

            return;
        }

        // Normal AI response — send via WhatsApp
        await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, aiResponse);
        await saveAiMessage(conversation.id, aiResponse);
    } catch (err) {
        console.error("Gemini AI chat error:", err);
        // Fallback message
        const fallback =
            lang === "hi"
                ? "क्षमा करें, कुछ तकनीकी समस्या हुई। कृपया दोबारा प्रयास करें।"
                : "Sorry, something went wrong. Please try again.";
        await sendWhatsAppText(creds.apiKey, creds.phoneNumberId, to, fallback);
        await saveAiMessage(conversation.id, fallback);
    }
}
