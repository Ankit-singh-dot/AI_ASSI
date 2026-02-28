import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
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

        const conversations = await prisma.conversation.findMany({
            where: { userId: user.id, status: "Active" },
            include: {
                lead: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        const formatted = conversations.map(c => {
            const lastMessage = c.messages[0];
            return {
                id: c.id,
                leadName: c.lead?.name || "Unknown Lead",
                preview: lastMessage?.text || "No messages yet",
                unread: c.unreadCount || 0,
                timestamp: lastMessage ? lastMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : c.updatedAt.toLocaleDateString()
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error("Fetch Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
