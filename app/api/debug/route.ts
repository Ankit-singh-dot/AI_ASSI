import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const integrations = await prisma.integration.findMany();

        // Hide full api key for security, just show first 10 chars
        const safeIntegrations = integrations.map((i: any) => ({
            ...i,
            apiKey: i.apiKey ? `${i.apiKey.substring(0, 10)}...` : null,
            webhookSecret: i.webhookSecret ? `***` : null
        }));

        return NextResponse.json({ integrations: safeIntegrations });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
