import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, onboardingComplete: true, clerkId: true },
    });
    console.log("\n=== USERS ===");
    console.table(users);

    const integrations = await prisma.integration.findMany({
        select: { id: true, userId: true, platform: true, status: true },
    });
    console.log("\n=== INTEGRATIONS ===");
    console.table(integrations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
