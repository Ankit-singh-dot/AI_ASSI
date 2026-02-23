import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeLeadScore } from "@/actions/ai-score";

// Meta Webhook Verification (required when setting up the webhook in Meta Developer Portal)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // In a real app, you'd verify 'token' against your env variable WEBHOOK_VERIFY_TOKEN
    if (mode === "subscribe" && token) {
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
}

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        let platform = url.searchParams.get("platform");
        const secret = url.searchParams.get("secret"); // Used for website forms

        const bodyText = await req.text();
        let payload;
        try {
            payload = JSON.parse(bodyText);
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        let senderName = "Unknown";
        let senderContact = "";
        let messageText = "";
        let integrationId = null;
        let userId = null;

        // --- 1. Identify User and Parse Payload --- //

        if (platform === "website_forms") {
            // Website Forms use a custom secret in the URL
            if (!secret) return NextResponse.json({ error: "Missing secret" }, { status: 401 });

            const integration = await prisma.integration.findFirst({
                where: { platform: "website_forms", webhookSecret: secret },
            });

            if (!integration) return NextResponse.json({ error: "Invalid secret" }, { status: 401 });

            userId = integration.userId;
            senderName = payload.name || "Website Visitor";
            senderContact = payload.email || payload.phone || "unknown@web.com";
            messageText = payload.message || payload.query || "";

        } else if (payload.object === "whatsapp_business_account") {
            platform = "whatsapp";
            // Meta WhatsApp Payload
            const entry = payload.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (!value || !value.messages || value.messages.length === 0) {
                return NextResponse.json({ success: true, message: "Not a message payload" });
            }

            const message = value.messages[0];
            const contact = value.contacts?.[0];

            senderContact = message.from; // Phone number
            senderName = contact?.profile?.name || senderContact;
            messageText = message.text?.body || "[Media/Interactive Content]";

            const phoneNumberId = value.metadata?.phone_number_id;

            // Find which user owns this WhatsApp Phone Number ID
            // Prisma JSON querying can be tricky, so we might need to fetch all connected whatsapp ints or use raw query.
            // For now, we'll assume a simpler approach for the demo or search by metadata
            const integrations = await prisma.integration.findMany({
                where: { platform: "whatsapp", status: "connected" }
            });

            const integration = integrations.find(i => (i.metadata as any)?.phoneNumberId === phoneNumberId);
            if (integration) {
                userId = integration.userId;
            } else {
                return NextResponse.json({ error: "No user found for this phone number" }, { status: 404 });
            }

        } else if (payload.object === "instagram") {
            platform = "instagram";
            // Meta Instagram Payload (similar structure to Messenger)
            const entry = payload.entry?.[0];
            const messaging = entry?.messaging?.[0];

            if (!messaging || !messaging.message) {
                return NextResponse.json({ success: true, message: "Not a message payload" });
            }

            senderContact = messaging.sender?.id;
            senderName = `IG User ${senderContact}`; // IG Graph API requires separate call to get username
            messageText = messaging.message.text || "[Media Content]";

            const recipientId = messaging.recipient?.id;

            const integrations = await prisma.integration.findMany({
                where: { platform: "instagram", status: "connected" }
            });

            const integration = integrations.find(i => (i.metadata as any)?.pageId === recipientId || (i.metadata as any)?.igId === recipientId);
            if (integration) {
                userId = integration.userId;
            } else {
                return NextResponse.json({ error: "No user found for this IG account" }, { status: 404 });
            }
        } else {
            // General fallback
            if (!platform) return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
            return NextResponse.json({ error: "Unsupported payload structure" }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "Could not identify target user" }, { status: 404 });
        }

        // --- 2. Auto-Create Lead --- //
        // Try to find existing lead for this user and contact info
        let lead = await prisma.lead.findFirst({
            where: {
                userId: userId,
                OR: [
                    { phone: senderContact },
                    { email: senderContact },
                    { name: senderName }
                ]
            }
        });

        if (!lead) {
            lead = await prisma.lead.create({
                data: {
                    userId,
                    name: senderName,
                    phone: platform === "whatsapp" ? senderContact : null,
                    email: platform === "website_forms" && senderContact.includes("@") ? senderContact : null,
                    source: platform,
                    status: "new",
                }
            });
        }

        // --- 3. Auto-Create Conversation --- //
        let conversation = await prisma.conversation.findFirst({
            where: {
                userId,
                leadId: lead.id,
                channel: platform
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    userId,
                    leadId: lead.id,
                    channel: platform,
                    status: "Active"
                }
            });
        }

        // Update conversation unread count
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                unreadCount: { increment: 1 },
                updatedAt: new Date()
            }
        });

        // --- 4. Save Message --- //
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                sender: "customer",
                text: messageText,
            }
        });

        // --- 5. Async AI Scoring Update --- //
        // Fire and forget the scoring mechanism so it doesn't block the webhook response
        analyzeLeadScore(conversation.id, userId).catch(err => {
            console.error("Async AI Scoring failed:", err);
        });

        return NextResponse.json({ success: true, message: "Message ingested successfully" });

    } catch (e: any) {
        console.error("Webhook Ingest Error:", e);
        return NextResponse.json({ error: "Internal Server Error", details: e.message }, { status: 500 });
    }
}
