import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: id, userId: user.id }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // Clear unread count when viewed
        if (conversation.unreadCount > 0) {
            await prisma.conversation.update({
                where: { id },
                data: { unreadCount: 0 }
            });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: "desc" }
        });

        const formatted = messages.map(m => ({
            id: m.id,
            role: m.sender === "customer" ? "customer" : "agent",
            content: m.text,
            timestamp: m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { userId: clerkId } = await auth();
        if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await req.json();
        const { content } = body;

        if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

        const conversation = await prisma.conversation.findUnique({
            where: { id: id, userId: user.id }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId: id,
                sender: "agent",
                text: content,
            }
        });

        await prisma.conversation.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
