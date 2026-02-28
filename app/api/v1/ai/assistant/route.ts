import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);


const SYSTEM_PROMPT = `
You are the official AI Assistant for a premium AI-Powered CRM platform. Your job is to help users navigate the app, explain features, and guide them to success. 
Keep your answers highly concise (under 3-4 sentences), professional, and extremely helpful.

### Knowledge Base: Platform Features & Capabilities
- **CRM/Leads Management**: Users can manually add leads or auto-ingest them via Webhooks (WhatsApp, Email, Custom API). Leads get automatic Sentiment emojis (😊 😐 😞) and Scores (0-100).
- **Inbox & Chat**: An iMessage-style interface to talk to leads. Includes a magical "Sparkles" button that auto-drafts responses based on the entire conversation history.
- **AI Scoring System**: When new messages arrive, the backend asynchronously analyzes the last 10 messages using Gemini AI to dynamically recalculate the Lead's score and sentiment.
- **Dashboard**: Shows total leads, conversion rates, charts, and a vertical activity timeline (e.g., "New lead added").
- **Google Sheets Integration**: Users can import leads by pasting a public Google Sheet URL in the Campaign section. They can use variables like {{FirstName}} in templates.
- **Quick Replies**: Users can save canned templates.
- **Automations**: IF-THEN rules (e.g., IF Lead score > 80 THEN notify team).

If a user asks how to do something, guide them accurately using the knowledge above. Do not hallucinate features that are not listed here.
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
        }

        
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


        const initialHistory = [
            {
                role: "user",
                parts: [{ text: "SYSTEM PROMPT (Internal Use Only): " + SYSTEM_PROMPT }]
            },
            {
                role: "model",
                parts: [{ text: "Acknowledged. I am the platform's AI Assistant. How can I help the user today?" }]
            }
        ];

        // The last message in the array is the user's current question
        const userQuestion = messages[messages.length - 1].text;

        // Add previous message history if it exists (skipping the very last one as it's sent via sendMessage)
        if (messages.length > 1) {
            for (let i = 0; i < messages.length - 1; i++) {
                // Convert 'assistant' role to 'model' for Gemini
                const geminiRole = messages[i].role === 'assistant' ? 'model' : 'user';
                initialHistory.push({
                    role: geminiRole,
                    parts: [{ text: messages[i].text }]
                });
            }
        }

        const chat = model.startChat({
            history: initialHistory as any
        });

        const result = await chat.sendMessage(userQuestion);
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });

    } catch (error) {
        console.error("Floating Assistant API Error:", error);
        return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
    }
}
