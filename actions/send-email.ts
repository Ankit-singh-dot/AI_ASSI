"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import nodemailer from "nodemailer";

/**
 * Send an email via the user's connected Gmail integration using SMTP.
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

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: senderEmail,
                pass: gmail.apiKey,
            },
        });

        // Test credentials just to be safe
        await transporter.verify();

        const info = await transporter.sendMail({
            from: senderEmail,
            to: data.to,
            subject: data.subject,
            text: data.body,
        });

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
            messageId: info.messageId,
        };
    } catch (e: any) {
        let errorMsg = e.message || "Failed to send email via SMTP.";

        // If authentication failed, mark integration as error
        if (errorMsg.includes("Invalid login") || errorMsg.includes("BadCredentials") || errorMsg.includes("Username and Password not accepted")) {
            await prisma.integration.update({
                where: { id: gmail.id },
                data: { status: "error" },
            });
            errorMsg = "Gmail App Password invalid. Please reconnect in Settings.";
        }

        return { success: false, message: errorMsg };
    }
}
