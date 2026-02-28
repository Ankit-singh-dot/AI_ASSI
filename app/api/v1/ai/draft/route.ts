import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await req.json();
        const { conversationId } = body;

        if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId, userId: user.id },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
                lead: true
            }
        });

        if (!conversation || conversation.messages.length === 0) {
            return NextResponse.json({ error: "No conversation history found" }, { status: 404 });
        }

        const transcript = conversation.messages.map(m => {
            const speaker = m.sender === "agent" ? "Agent" : "Customer";
            return `${speaker}: ${m.text}`;
        }).join("\n");

        const prompt = `
    You are an expert sales and support agent. 
    Review the following conversation transcript.
    The user is asking a business ("Agent") a question or making a statement.
    Write a highly professional, concise, and helpful response on behalf of the Agent.
    Do not include any placeholders, just the raw text of the response.
    Keep it strictly under 3 sentences.
    
    Conversation Transcript:
    ${transcript}
    
    Response:`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const draft = result.response.text().trim();

        return NextResponse.json({ draft });
    } catch (error) {
        console.error("AI Draft Generator Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
