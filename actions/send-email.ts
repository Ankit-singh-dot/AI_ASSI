"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";

/**
 * Send an email via the user's connected Gmail integration using the Gmail API.
 */
export async function sendOutreachEmail(data: {
    to: string;
    subject: string;
    body: string;
    leadId?: string;
}) {
    const dbUser = await getDbUser();

    // Get Gmail integration
    const gmail = await prisma.integration.findFirst({
        where: { userId: dbUser.id, platform: "gmail", status: "connected" },
    });

    if (!gmail || !gmail.apiKey) {
        return { success: false, message: "Gmail is not connected. Go to Settings → Integrations to connect." };
    }

    const senderEmail = (gmail.metadata as any)?.email || dbUser.email;

    // Build RFC 2822 email
    const emailLines = [
        `From: ${senderEmail}`,
        `To: ${data.to}`,
        `Subject: ${data.subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        data.body,
    ];
    const rawMessage = emailLines.join("\r\n");

    // Base64url encode (Gmail API requirement)
    const encodedMessage = Buffer.from(rawMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${gmail.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: encodedMessage }),
        });

        if (res.ok) {
            const result = await res.json();

            // Log activity
            try {
                await prisma.activity.create({
                    data: {
                        userId: dbUser.id,
                        title: "Email sent",
                        description: `Outreach email sent to ${data.to}`,
                        channel: "email",
                    },
                });
            } catch (e) {
                // Activity logging is non-critical
            }

            return {
                success: true,
                message: `Email sent to ${data.to} ✓`,
                messageId: result.id,
            };
        } else {
            const err = await res.json().catch(() => ({}));
            const errorMsg = err?.error?.message || res.statusText;

            // If token expired, mark integration as error
            if (res.status === 401) {
                await prisma.integration.update({
                    where: { id: gmail.id },
                    data: { status: "error" },
                });
                return { success: false, message: "Gmail token expired. Please reconnect in Settings." };
            }

            return { success: false, message: `Gmail API error: ${errorMsg}` };
        }
    } catch (e: any) {
        return { success: false, message: `Failed to send: ${e.message}` };
    }
}
