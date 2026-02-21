import { getConversations } from "@/actions/conversations";
import ConversationsClient from "./Client";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export default async function ConversationsPage() {
    let conversations: any[] = [];
    try {
        conversations = await getConversations();

        // Seed some demo data if empty
        if (conversations.length === 0) {
            const user = await currentUser();
            if (user) {
                const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
                if (dbUser) {
                    const lead = await prisma.lead.create({
                        data: {
                            userId: dbUser.id,
                            name: "Demo Customer",
                            email: "demo@example.com",
                            phone: "+1234567890"
                        }
                    });
                    await prisma.conversation.create({
                        data: {
                            userId: dbUser.id,
                            leadId: lead.id,
                            channel: "whatsapp",
                            messages: {
                                create: {
                                    sender: "customer",
                                    text: "Hi! How does your product work?"
                                }
                            }
                        }
                    });
                    // Re-fetch
                    conversations = await getConversations();
                }
            }
        }
    } catch (error) {
        console.error("Failed to load conversations:", error);
    }

    return (
        <ConversationsClient initialConversations={conversations} />
    );
}
