"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const PLATFORMS = [
    { platform: "whatsapp", name: "WhatsApp Business", description: "Connect via Meta Cloud API to send and receive WhatsApp messages" },
    { platform: "instagram", name: "Instagram DMs", description: "Connect your Instagram Business account for DM management" },
    { platform: "gmail", name: "Gmail", description: "Connect via Gmail API for email lead capture and outreach" },
    { platform: "calendar", name: "Google Calendar", description: "Sync appointments and availability with Google Calendar" },
    { platform: "website_forms", name: "Website Forms", description: "Capture leads from your website using a webhook endpoint" },
    { platform: "make_webhook", name: "Make Automation (Campaigns)", description: "Send leads to a Make.com webhook for bulk emailing" },
    { platform: "make_scraper_webhook", name: "Make Automation (Scraper)", description: "Trigger a Make.com Google Maps Scraper for Local Leads" },
];

export async function getIntegrations() {
    const dbUser = await getDbUser();

    // Fetch existing integrations
    const existing = await prisma.integration.findMany({
        where: { userId: dbUser.id },
    });

    // If there are new platforms added to the code that the user doesn't have yet, seed them
    const existingPlatforms = new Set(existing.map(i => i.platform));
    const missingPlatforms = PLATFORMS.filter(p => !existingPlatforms.has(p.platform));

    if (missingPlatforms.length > 0) {
        await prisma.integration.createMany({
            data: missingPlatforms.map((p) => ({
                userId: dbUser.id,
                platform: p.platform,
                status: "disconnected",
                webhookSecret: crypto.randomBytes(16).toString("hex"),
            })),
        });
    }

    return prisma.integration.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "asc" },
    });
}

export async function connectIntegration(
    platform: string,
    config: { apiKey?: string; webhookUrl?: string; metadata?: Record<string, any> }
) {
    const dbUser = await getDbUser();

    const integration = await prisma.integration.upsert({
        where: { userId_platform: { userId: dbUser.id, platform } },
        update: {
            status: "connected",
            apiKey: config.apiKey || null,
            webhookUrl: config.webhookUrl || null,
            metadata: config.metadata || undefined,
            connectedAt: new Date(),
        },
        create: {
            userId: dbUser.id,
            platform,
            status: "connected",
            apiKey: config.apiKey || null,
            webhookUrl: config.webhookUrl || null,
            webhookSecret: crypto.randomBytes(16).toString("hex"),
            metadata: config.metadata || undefined,
            connectedAt: new Date(),
        },
    });

    // Log activity
    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: `Integration connected`,
            description: `${platform} integration activated`,
            channel: platform,
        },
    });

    revalidatePath("/dashboard/settings");
    return integration;
}

export async function disconnectIntegration(integrationId: string) {
    const dbUser = await getDbUser();

    const integration = await prisma.integration.update({
        where: { id: integrationId, userId: dbUser.id },
        data: {
            status: "disconnected",
            apiKey: null,
            webhookUrl: null,
            metadata: Prisma.DbNull,
            connectedAt: null,
        },
    });

    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: `Integration disconnected`,
            description: `${integration.platform} integration deactivated`,
            channel: integration.platform,
        },
    });

    revalidatePath("/dashboard/settings");
    return integration;
}

export async function testIntegration(integrationId: string) {
    const dbUser = await getDbUser();

    const integration = await prisma.integration.findFirst({
        where: { id: integrationId, userId: dbUser.id },
    });

    if (!integration) throw new Error("Integration not found");

    if (integration.status !== "connected") {
        return { success: false, message: "Integration is not connected" };
    }

    switch (integration.platform) {
        case "gmail": {
            if (!integration.apiKey) return { success: false, message: "No OAuth token provided" };
            try {
                // Test Gmail API — fetch user profile
                const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
                    headers: { Authorization: `Bearer ${integration.apiKey}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    return { success: true, message: `Gmail connected ✓ — ${data.emailAddress} (${data.messagesTotal} emails)` };
                } else {
                    const err = await res.json().catch(() => ({}));
                    return { success: false, message: `Gmail API error: ${err?.error?.message || res.statusText}` };
                }
            } catch (e: any) {
                return { success: false, message: `Gmail test failed: ${e.message}` };
            }
        }

        case "calendar": {
            if (!integration.apiKey) return { success: false, message: "No OAuth token provided" };
            try {
                const meta = integration.metadata as any;
                const calendarId = meta?.calendarId || "primary";
                const now = new Date().toISOString();
                // Test Calendar API — fetch next 3 upcoming events
                const res = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=3&timeMin=${now}&singleEvents=true&orderBy=startTime`,
                    { headers: { Authorization: `Bearer ${integration.apiKey}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    const eventCount = data.items?.length || 0;
                    const summary = data.summary || calendarId;
                    return { success: true, message: `Calendar connected ✓ — "${summary}" (${eventCount} upcoming event${eventCount !== 1 ? "s" : ""})` };
                } else {
                    const err = await res.json().catch(() => ({}));
                    return { success: false, message: `Calendar API error: ${err?.error?.message || res.statusText}` };
                }
            } catch (e: any) {
                return { success: false, message: `Calendar test failed: ${e.message}` };
            }
        }

        case "whatsapp": {
            if (!integration.apiKey) return { success: false, message: "No API key provided" };
            try {
                const meta = integration.metadata as any;
                const phoneId = meta?.phoneNumberId;
                if (!phoneId) return { success: false, message: "No Phone Number ID configured" };
                const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, {
                    headers: { Authorization: `Bearer ${integration.apiKey}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    return { success: true, message: `WhatsApp connected ✓ — ${data.display_phone_number || data.verified_name || "Phone verified"}` };
                } else {
                    const err = await res.json().catch(() => ({}));
                    return { success: false, message: `WhatsApp API error: ${err?.error?.message || res.statusText}` };
                }
            } catch (e: any) {
                return { success: false, message: `WhatsApp test failed: ${e.message}` };
            }
        }

        case "instagram": {
            if (!integration.apiKey) return { success: false, message: "No access token provided" };
            try {
                const res = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,username&access_token=${integration.apiKey}`);
                if (res.ok) {
                    const data = await res.json();
                    return { success: true, message: `Instagram connected ✓ — @${data.username || data.name || data.id}` };
                } else {
                    const err = await res.json().catch(() => ({}));
                    return { success: false, message: `Instagram API error: ${err?.error?.message || res.statusText}` };
                }
            } catch (e: any) {
                return { success: false, message: `Instagram test failed: ${e.message}` };
            }
        }

        case "website_forms":
            return { success: true, message: `Webhook active ✓ — POST to /api/webhooks/ingest?platform=website_forms` };

        case "make_webhook":
        case "make_scraper_webhook": {
            if (!integration.webhookUrl) return { success: false, message: "No Webhook URL provided" };
            try {
                // Ping the Make webhook to see if it responds
                const res = await fetch(integration.webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ping: true, source: "FlowAI Test" }),
                });
                if (res.ok) {
                    return { success: true, message: "Make.com Webhook is reachable ✓" };
                } else {
                    return { success: false, message: `Webhook responded with status: ${res.status}` };
                }
            } catch (e: any) {
                return { success: false, message: `Webhook test failed: ${e.message}` };
            }
        }

        default:
            return { success: false, message: "Unknown platform" };
    }
}
