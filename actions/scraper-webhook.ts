"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";

/**
 * Trigger the user's connected Make.com Google Maps Scraper Webhook.
 */
export async function triggerMakeScraper(niche: string, city: string, service: string) {
    if (!niche || !city || !service) {
        return { success: false, message: "Niche, City, and Service are required fields." };
    }

    const dbUser = await getDbUser();

    // Verify integration exists
    const integration = await prisma.integration.findFirst({
        where: { userId: dbUser.id, platform: "make_scraper_webhook", status: "connected" },
    });

    if (!integration || !integration.webhookUrl) {
        return { success: false, message: "Make.com Scraper webhook is not configured or missing URL." };
    }

    try {
        // Prepare payload structured specifically for the user's Make.com scraper flow
        const payload = {
            action: "trigger_local_scraper",
            timestamp: new Date().toISOString(),
            niche: niche.trim(),
            city: city.trim(),
            service: service.trim(),
            user: {
                email: dbUser.email,
                name: `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim(),
            },
        };

        const res = await fetch(integration.webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Make Webhook returned status ${res.status}`);
        }

        // Log the activity
        try {
            await prisma.activity.create({
                data: {
                    userId: dbUser.id,
                    title: "Local Lead Scraper Initiated",
                    description: `Searching for ${niche} in ${city} offering ${service}`,
                    channel: "make_scraper_webhook",
                },
            });
        } catch (e) {
            console.error("Failed to log make webhook activity", e);
        }

        return { success: true, message: "Scraper successfully initiated via Make.com!" };
    } catch (error: any) {
        console.error("Make Scraper trigger failed:", error);
        return { success: false, message: error.message || "Failed to trigger scraper webhook." };
    }
}
