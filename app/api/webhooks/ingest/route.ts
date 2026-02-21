import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook Ingest API
 * POST /api/webhooks/ingest?platform=whatsapp
 * 
 * Accepts incoming leads/messages from external sources.
 * Validates against the integration's webhook secret.
 * 
 * Body: {
 *   secret: string,          // Webhook secret for authentication
 *   name: string,            // Lead name
 *   email?: string,
 *   phone?: string,
 *   message?: string,        // Optional first message
 *   metadata?: object        // Any extra data
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const platform = req.nextUrl.searchParams.get("platform") || "website_forms";
        const body = await req.json();

        const { secret, name, email, phone, message, metadata } = body;

        if (!secret || !name) {
            return NextResponse.json(
                { error: "Missing required fields: secret, name" },
                { status: 400 }
            );
        }

        // Find integration by webhook secret
        const integration = await prisma.integration.findFirst({
            where: {
                webhookSecret: secret,
                platform,
                status: "connected",
            },
        });

        if (!integration) {
            return NextResponse.json(
                { error: "Invalid webhook secret or integration not connected" },
                { status: 401 }
            );
        }

        // Create lead
        const lead = await prisma.lead.create({
            data: {
                userId: integration.userId,
                name,
                email: email || null,
                phone: phone || null,
                source: platform === "website_forms" ? "website" : platform,
                status: "new",
                score: 50,
                sentiment: "neutral",
            },
        });

        // Create conversation with optional first message
        if (message) {
            await prisma.conversation.create({
                data: {
                    userId: integration.userId,
                    leadId: lead.id,
                    channel: platform === "website_forms" ? "web" : platform,
                    messages: {
                        create: {
                            sender: "customer",
                            text: message,
                        },
                    },
                },
            });
        }

        // Log activity
        await prisma.activity.create({
            data: {
                userId: integration.userId,
                title: "New lead from webhook",
                description: `${name} captured via ${platform}`,
                channel: platform,
            },
        });

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            message: `Lead "${name}" created successfully via ${platform}`,
        });
    } catch (error) {
        console.error("Webhook ingest error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "Webhook ingest endpoint is ready. Send a POST request with lead data.",
        requiredFields: ["secret", "name"],
        optionalFields: ["email", "phone", "message", "metadata"],
    });
}
