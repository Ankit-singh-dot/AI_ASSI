"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

/**
 * Find or create the DB user for the current Clerk session.
 * If the Clerk webhook hasn't fired yet, this auto-creates the user.
 */
export async function getDbUser() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const email =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
            ?.emailAddress || user.emailAddresses[0]?.emailAddress;

    if (!email) throw new Error("No email found for user");

    const dbUser = await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {},
        create: {
            clerkId: user.id,
            email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
        },
    });

    return dbUser;
}
