import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Using fast model for real-time chat

export type LeadAnalysis = {
    intent: string;
    sentiment: "positive" | "neutral" | "negative";
    leadScore: number;
};

/**
 * Analyzes an incoming customer message to extract intent, sentiment, and a lead score.
 */
export async function analyzeLeadMessage(message: string): Promise<LeadAnalysis> {
    const prompt = `
  You are an AI sales assistant analyzing an incoming customer message.
  Return a JSON object with:
  - "intent": a short 3-5 word summary of what the customer wants.
  - "sentiment": exactly one of "positive", "neutral", or "negative".
  - "leadScore": an integer from 0 to 100 indicating how likely they are to convert based on this message alone. 

  Analyze this message:
  "${message}"
  
  Format: JSON only, strictly matching the keys above. No other text.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();
        // Clean up potential markdown code block artifacts
        const jsonStr = response.replace(/^```json\s*/, "").replace(/```$/, "");

        return JSON.parse(jsonStr) as LeadAnalysis;
    } catch (error) {
        console.error("Error analyzing lead message explicitly:", error);
        return { intent: "Unknown intent", sentiment: "neutral", leadScore: 50 };
    }
}

/**
 * Generates an automated response based on the business profile and conversation context.
 */
export async function generateAutoResponse(
    businessProfile: any,
    conversationHistory: { role: string; content: string }[],
    newMessage: string
): Promise<string> {

    // Format the context
    const context = `
  You are an AI sales agent for the following business:
  Name: ${businessProfile.businessName || "Our Company"}
  Industry: ${businessProfile.industry || "General"}
  Hours: ${businessProfile.businessHours || "9 AM to 6 PM"}

  Your goal is to reply to the user's latest message helpfuly, professionally, naturally, and concisely. Keep it under 3 sentences if possible. Try to push for a meeting or clear next step.
  `;

    // Start chat session with system instruction context
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "SYSTEM PROMPT: " + context }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will act as the AI agent." }]
            },
            // Map history to Gemini's expected format
            ...conversationHistory.map(msg => ({
                role: msg.role === "ai" || msg.role === "model" ? "model" : "user",
                parts: [{ text: msg.content }]
            }))
        ],
    });

    try {
        const result = await chat.sendMessage([{ text: newMessage }]);
        return result.response.text();
    } catch (error) {
        console.error("Error generating auto response:", error);
        return "Thank you for reaching out. An agent will get back to you shortly.";
    }
}

/**
 * Summarizes an entire conversation thread into 2-3 sentences.
 */
export async function summarizeConversation(
    messages: { sender: string; text: string }[]
): Promise<string> {
    const transcript = messages
        .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
        .join("\n");

    const prompt = `
Summarize this sales conversation in exactly 2-3 concise sentences. 
Focus on: what the customer wants, current status, and recommended next action.

Conversation:
${transcript}

Summary:`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error summarizing conversation:", error);
        return "Unable to generate summary at this time.";
    }
}

/**
 * Generates a daily AI lead health brief based on pipeline data.
 */
export async function generateLeadHealthBrief(pipelineData: {
    totalLeads: number;
    newLeads: number;
    hotLeads: number;
    coldLeads: number;
    convertedLeads: number;
    negativeConversations: number;
}): Promise<string> {
    const prompt = `
You are an AI sales coach. Based on the following pipeline data, generate a SHORT 2-3 sentence daily brief.
Be actionable and direct. Use specific numbers. Don't use bullet points.

Pipeline:
- Total leads: ${pipelineData.totalLeads}
- New leads today: ${pipelineData.newLeads}
- Hot leads (score > 80): ${pipelineData.hotLeads}
- Cold leads (score < 30): ${pipelineData.coldLeads}
- Converted: ${pipelineData.convertedLeads}
- Negative sentiment conversations: ${pipelineData.negativeConversations}

Brief:`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error generating lead health brief:", error);
        return `You have ${pipelineData.totalLeads} total leads with ${pipelineData.hotLeads} hot prospects. Focus on your ${pipelineData.negativeConversations} at-risk conversations today.`;
    }
}
