"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

/**
 * Check if the current user has completed onboarding.
 */
export async function checkOnboardingStatus() {
    const user = await currentUser();
    if (!user) return { complete: false };

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        select: { onboardingComplete: true },
    });

    return { complete: dbUser?.onboardingComplete ?? false };
}

/**
 * Complete onboarding — saves business info, connects all integrations, and sets flag.
 */
export async function completeOnboarding(data: {
    businessName: string;
    industry: string;
    teamSize: string;
    integrations: {
        whatsapp?: { apiKey: string; phoneNumberId: string };
        instagram?: { apiKey: string; igUserId: string };
        gmail?: { apiKey: string; email: string };
        calendar?: { apiKey: string; calendarId: string };
        website_forms?: boolean; // Just enable/disable
    };
}) {
    try {
        const dbUser = await getDbUser();
        console.log("[onboarding] Starting for user:", dbUser.id);

        // 1. Save business profile
        await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                businessName: data.businessName,
                industry: data.industry,
                teamSize: data.teamSize,
            },
        });
        console.log("[onboarding] Business profile saved");

        // 2. Connect integrations (non-blocking — each one is independent)
        const platforms = [
            {
                platform: "whatsapp",
                config: data.integrations.whatsapp,
                getFields: (c: any) => ({ apiKey: c.apiKey, metadata: { phoneNumberId: c.phoneNumberId } }),
            },
            {
                platform: "instagram",
                config: data.integrations.instagram,
                getFields: (c: any) => ({ apiKey: c.apiKey, metadata: { igUserId: c.igUserId } }),
            },
            {
                platform: "gmail",
                config: data.integrations.gmail,
                getFields: (c: any) => ({ apiKey: c.apiKey, metadata: { email: c.email } }),
            },
            {
                platform: "calendar",
                config: data.integrations.calendar,
                getFields: (c: any) => ({ apiKey: c.apiKey, metadata: { calendarId: c.calendarId } }),
            },
        ];

        for (const p of platforms) {
            if (p.config) {
                try {
                    const fields = p.getFields(p.config);
                    await prisma.integration.upsert({
                        where: { userId_platform: { userId: dbUser.id, platform: p.platform } },
                        update: {
                            status: "connected",
                            apiKey: fields.apiKey,
                            metadata: fields.metadata,
                            connectedAt: new Date(),
                        },
                        create: {
                            userId: dbUser.id,
                            platform: p.platform,
                            status: "connected",
                            apiKey: fields.apiKey,
                            metadata: fields.metadata,
                            webhookSecret: crypto.randomBytes(16).toString("hex"),
                            connectedAt: new Date(),
                        },
                    });
                    console.log(`[onboarding] ${p.platform} connected`);
                } catch (e) {
                    console.error(`[onboarding] Failed to connect ${p.platform}:`, e);
                }
            }
        }

        // Website forms
        try {
            await prisma.integration.upsert({
                where: { userId_platform: { userId: dbUser.id, platform: "website_forms" } },
                update: {
                    status: data.integrations.website_forms ? "connected" : "disconnected",
                    connectedAt: data.integrations.website_forms ? new Date() : null,
                },
                create: {
                    userId: dbUser.id,
                    platform: "website_forms",
                    status: data.integrations.website_forms ? "connected" : "disconnected",
                    webhookSecret: crypto.randomBytes(16).toString("hex"),
                    connectedAt: data.integrations.website_forms ? new Date() : null,
                },
            });
        } catch (e) {
            console.error("[onboarding] Failed to setup website forms:", e);
        }

        // 3. Seed default automations
        try {
            const existingAutomations = await prisma.automation.count({ where: { userId: dbUser.id } });
            if (existingAutomations === 0) {
                await prisma.automation.createMany({
                    data: [
                        { userId: dbUser.id, name: "Auto-respond to new inquiries", trigger: "New WhatsApp message", action: "AI Auto-response", icon: "MessageSquare", color: "#25D366" },
                        { userId: dbUser.id, name: "Follow-up after 24h silence", trigger: "No response in 24h", action: "Send Follow-up", icon: "Clock", color: "#f59e0b" },
                        { userId: dbUser.id, name: "Hot lead alert", trigger: "Lead score > 80", action: "Notify Admin", icon: "Flame", color: "#ef4444" },
                    ],
                });
            }
        } catch (e) {
            console.error("[onboarding] Failed to seed automations:", e);
        }

        // 4. Mark onboarding as complete — THIS is the critical step
        await prisma.user.update({
            where: { id: dbUser.id },
            data: { onboardingComplete: true },
        });
        console.log("[onboarding] ✅ Complete!");

        return { success: true };
    } catch (error) {
        console.error("[onboarding] FATAL ERROR:", error);
        throw error; // Re-throw so the client sees the error
    }
}
