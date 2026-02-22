import { getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import ScraperClient from "./ScraperClient";

export default async function ScraperPage() {
    const dbUser = await getDbUser();

    // Fetch make webhook activities for scraper history
    const activities = await prisma.activity.findMany({
        where: {
            userId: dbUser.id,
            channel: "make_scraper_webhook"
        },
        orderBy: { createdAt: "desc" },
    });

    // Check if Make connection exists
    const makeWebhook = await prisma.integration.findFirst({
        where: { userId: dbUser.id, platform: "make_scraper_webhook", status: "connected" },
    });

    return (
        <ScraperClient
            initialHistory={activities}
            isMakeConnected={!!makeWebhook}
        />
    );
}
