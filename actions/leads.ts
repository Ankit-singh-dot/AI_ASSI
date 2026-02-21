"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function getLeads(filter?: string) {
    const dbUser = await getDbUser();

    const where: any = { userId: dbUser.id };
    if (filter && filter !== "all") {
        where.status = filter;
    }

    return prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { conversations: true } },
        },
    });
}

export async function createLead(data: {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status?: string;
    tags?: string[];
}) {
    const dbUser = await getDbUser();

    const lead = await prisma.lead.create({
        data: {
            userId: dbUser.id,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            source: data.source || "manual",
            status: data.status || "new",
            tags: data.tags || [],
        },
    });

    // Create activity
    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: "New lead added",
            description: `${data.name} added via ${data.source || "manual"}`,
            channel: data.source || "manual",
        },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    return lead;
}

export async function updateLeadStatus(leadId: string, status: string) {
    const dbUser = await getDbUser();

    const lead = await prisma.lead.update({
        where: { id: leadId, userId: dbUser.id },
        data: { status },
    });

    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: `Lead status changed`,
            description: `${lead.name} moved to ${status}`,
        },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    return lead;
}

export async function deleteLead(leadId: string) {
    const dbUser = await getDbUser();

    await prisma.lead.delete({
        where: { id: leadId, userId: dbUser.id },
    });

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
}
