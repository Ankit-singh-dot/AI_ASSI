"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";

/**
 * Trigger the user's connected Make.com webhook with a Google Spreadsheet URL.
 */
export async function triggerMakeSpreadsheetCampaign(spreadsheetUrl: string) {
    if (!spreadsheetUrl) {
        return { success: false, message: "No Spreadsheet URL provided" };
    }

    const dbUser = await getDbUser();

    // Verify integration exists
    const integration = await prisma.integration.findFirst({
        where: { userId: dbUser.id, platform: "make_webhook", status: "connected" },
    });

    if (!integration || !integration.webhookUrl) {
        return { success: false, message: "Make.com webhook not configured or missing URL." };
    }

    try {
        // Prepare payload designed purely to trigger Make and pass the URL
        const payload = {
            action: "trigger_spreadsheet_campaign",
            timestamp: new Date().toISOString(),
            spreadsheetUrl: spreadsheetUrl,
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
                    title: "Make.com Spreadsheet Campaign Triggered",
                    description: `Sent spreadsheet link to Make.com webhook`,
                    channel: "make_webhook",
                },
            });
        } catch (e) {
            console.error("Failed to log make webhook activity", e);
        }

        return { success: true, message: "Webhook triggered successfully! Make.com is handling the rest." };
    } catch (error: any) {
        console.error("Make Webhook trigger failed:", error);
        return { success: false, message: error.message || "Failed to trigger webhook." };
    }
}
