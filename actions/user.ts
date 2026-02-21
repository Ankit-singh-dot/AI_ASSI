"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
    const user = await currentUser();
    if (!user) return null;

    return prisma.user.findUnique({
        where: { clerkId: user.id },
    });
}

export async function updateBusinessProfile(data: {
    businessName: string;
    industry: string;
    businessHours: string;
    teamSize: string;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const updatedUser = await prisma.user.update({
        where: { clerkId: user.id },
        data,
    });

    revalidatePath("/dashboard/settings");
    return updatedUser;
}

export async function updateNotificationSettings(data: {
    notifyNewLead?: boolean;
    notifyHotLead?: boolean;
    notifyNegative?: boolean;
    notifyFollowUps?: boolean;
    notifyAppointments?: boolean;
    notifyWeeklyReport?: boolean;
}) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const updatedUser = await prisma.user.update({
        where: { clerkId: user.id },
        data,
    });

    revalidatePath("/dashboard/settings");
    return updatedUser;
}

export async function updateTheme(theme: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { clerkId: user.id },
        data: { theme },
    });

    revalidatePath("/dashboard/settings");
}
