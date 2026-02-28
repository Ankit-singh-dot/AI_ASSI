import { getConversations } from "@/actions/conversations";
import ConversationsClient from "./ConversationsClient";
import { getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Conversations | FlowAI",
};

export default async function ConversationsPage() {
    const user = await getDbUser();

    // We also might want to pass quick replies to the client
    const quickReplies = await prisma.quickReply.findMany({
        where: { userId: user.id },
        orderBy: { usageCount: "desc" }
    });

    const conversations = await getConversations();

    return (
        <main className="flex-1 overflow-hidden bg-black/40 h-full">
            <ConversationsClient
                initialConversations={conversations}
                quickReplies={quickReplies}
            />
        </main>
    );
}
