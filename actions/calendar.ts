"use server";

import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function getAppointments(weekStart?: Date) {
    const dbUser = await getDbUser();

    const start = weekStart || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return prisma.appointment.findMany({
        where: {
            userId: dbUser.id,
            startTime: { gte: start, lte: end },
        },
        include: { lead: true },
        orderBy: { startTime: "asc" },
    });
}

export async function getUpcomingAppointments() {
    const dbUser = await getDbUser();

    return prisma.appointment.findMany({
        where: {
            userId: dbUser.id,
            startTime: { gte: new Date() },
        },
        include: { lead: true },
        orderBy: { startTime: "asc" },
        take: 5,
    });
}

export async function createAppointment(data: {
    title: string;
    type?: string;
    startTime: string;
    endTime: string;
    duration?: string;
    meetingLink?: string;
    notes?: string;
    leadId?: string;
}) {
    const dbUser = await getDbUser();

    const appointment = await prisma.appointment.create({
        data: {
            userId: dbUser.id,
            title: data.title,
            type: data.type || "demo",
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            duration: data.duration || "30 min",
            meetingLink: data.meetingLink || null,
            notes: data.notes || null,
            leadId: data.leadId || null,
        },
    });

    // Log activity
    await prisma.activity.create({
        data: {
            userId: dbUser.id,
            title: "Meeting Booked",
            description: data.title,
        },
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");
    return appointment;
}

export async function deleteAppointment(appointmentId: string) {
    const dbUser = await getDbUser();

    await prisma.appointment.delete({
        where: { id: appointmentId, userId: dbUser.id },
    });

    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard");
}

export async function getCalendarStats() {
    const dbUser = await getDbUser();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const totalMeetings = await prisma.appointment.count({
        where: {
            userId: dbUser.id,
            startTime: { gte: weekStart, lte: weekEnd },
        },
    });

    return {
        totalMeetings,
        avgDuration: "28 min", // Simplified
        noShows: 0,
    };
}
