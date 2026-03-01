"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";


async function getVapiCredentials(userId: string) {
    const integration = await prisma.integration.findFirst({
        where: { userId, platform: "vapi", status: "connected" },
    });

    if (!integration || !integration.apiKey) return null;

    const meta = integration.metadata as any;
    return {
        apiKey: integration.apiKey,
        assistantId: meta?.assistantId as string | undefined,
        phoneNumberId: meta?.phoneNumberId as string | undefined,
    };
}


export async function triggerVapiCall(leadId: string | null, phoneNumber: string) {
    const dbUser = await getDbUser();

    const creds = await getVapiCredentials(dbUser.id);
    if (!creds) throw new Error("VAPI is not configured. Go to Settings → Integrations to connect.");
    if (!creds.assistantId) throw new Error("VAPI Assistant ID is missing from configuration.");
    if (!creds.phoneNumberId) throw new Error("VAPI Phone Number ID is missing from configuration.");

    // Normalize phone number to E.164 format — strip everything except digits and leading +
    const hasPlus = phoneNumber.trim().startsWith("+");
    let digits = phoneNumber.replace(/\D/g, ""); // keep only digits
    if (digits.length === 10) {
        // 10-digit Indian number without country code
        digits = "91" + digits;
    }
    const normalizedPhone = "+" + digits;
    // Validate E.164: must be + followed by 7-15 digits
    if (!/^\+\d{7,15}$/.test(normalizedPhone)) {
        throw new Error(`Invalid phone number "${phoneNumber}". Use E.164 format like +919876543210`);
    }

    // Create the DB record first
    const voiceCall = await prisma.voiceCall.create({
        data: {
            userId: dbUser.id,
            leadId,
            phoneNumber: normalizedPhone,
            assistantId: creds.assistantId,
            status: "queued",
        },
    });

    // Call the VAPI API
    try {
        const res = await fetch("https://api.vapi.ai/call", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${creds.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                assistantId: creds.assistantId,
                phoneNumberId: creds.phoneNumberId,
                customer: { number: normalizedPhone },
            }),
        });

        // Safely parse response (VAPI sometimes returns plain text like "unauthorized")
        const responseText = await res.text();
        let data: any = {};
        try {
            data = JSON.parse(responseText);
        } catch {
            // Response is plain text, not JSON
            if (!res.ok) {
                await prisma.voiceCall.update({
                    where: { id: voiceCall.id },
                    data: { status: "failed" },
                });
                throw new Error(responseText || `VAPI returned status ${res.status}`);
            }
        }

        if (!res.ok) {
            await prisma.voiceCall.update({
                where: { id: voiceCall.id },
                data: { status: "failed" },
            });
            throw new Error(data.message || data.error || responseText || "VAPI API rejected the call request");
        }

        // Update with VAPI call ID and status
        await prisma.voiceCall.update({
            where: { id: voiceCall.id },
            data: {
                vapiCallId: data.id,
                status: data.status || "ringing",
            },
        });

        // Log activity
        const lead = leadId
            ? await prisma.lead.findFirst({ where: { id: leadId } })
            : null;

        await prisma.activity.create({
            data: {
                userId: dbUser.id,
                title: "AI Voice Call initiated",
                description: `Called ${lead?.name || normalizedPhone} via VAPI AI`,
                channel: "vapi",
            },
        });

        revalidatePath("/dashboard/outreach");
        return { ...voiceCall, vapiCallId: data.id, status: data.status || "ringing" };
    } catch (err: any) {
        console.error("VAPI Call Error:", err);
        throw new Error(err.message || "Failed to initiate VAPI call");
    }
}

// ── Get call history ──
export async function getCallHistory() {
    const dbUser = await getDbUser();

    return prisma.voiceCall.findMany({
        where: { userId: dbUser.id },
        include: { lead: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}

// ── Sync call status from VAPI ──
export async function syncCallStatus(voiceCallId: string) {
    const dbUser = await getDbUser();

    const call = await prisma.voiceCall.findFirst({
        where: { id: voiceCallId, userId: dbUser.id },
    });

    if (!call || !call.vapiCallId) return call;

    const creds = await getVapiCredentials(dbUser.id);
    if (!creds) return call;

    try {
        const res = await fetch(`https://api.vapi.ai/call/${call.vapiCallId}`, {
            headers: { Authorization: `Bearer ${creds.apiKey}` },
        });

        if (!res.ok) return call;

        const text = await res.text();
        let data: any;
        try { data = JSON.parse(text); } catch { return call; }

        const updated = await prisma.voiceCall.update({
            where: { id: voiceCallId },
            data: {
                status: data.status || call.status,
                duration: data.endedAt && data.startedAt
                    ? Math.round((new Date(data.endedAt).getTime() - new Date(data.startedAt).getTime()) / 1000)
                    : call.duration,
                summary: data.summary || data.analysis?.summary || call.summary,
            },
        });

        revalidatePath("/dashboard/outreach");
        return updated;
    } catch (err) {
        console.error("VAPI status sync error:", err);
        return call;
    }
}

// ── Bulk trigger calls ──
export async function triggerBulkCalls(leads: { id: string; phone: string }[]) {
    const results = [];
    for (const lead of leads) {
        try {
            const result = await triggerVapiCall(lead.id, lead.phone);
            results.push({ leadId: lead.id, success: true, call: result });
            // Small delay between calls to avoid rate limiting
            await new Promise((r) => setTimeout(r, 1500));
        } catch (err: any) {
            results.push({ leadId: lead.id, success: false, error: err.message });
        }
    }
    return results;
}
