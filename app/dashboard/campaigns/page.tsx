import { getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import CampaignsClient from "./CampaignsClient";

export default async function CampaignsPage() {
    const dbUser = await getDbUser();

    // Fetch make webhook activities for campaign history
    const activities = await prisma.activity.findMany({
        where: {
            userId: dbUser.id,
            channel: "make_webhook"
        },
        orderBy: { createdAt: "desc" },
    });

    // Check if Make connection exists
    const makeWebhook = await prisma.integration.findFirst({
        where: { userId: dbUser.id, platform: "make_webhook", status: "connected" },
    });

    return (
        <CampaignsClient
            initialHistory={activities}
            isMakeConnected={!!makeWebhook}
        />
    );
}
