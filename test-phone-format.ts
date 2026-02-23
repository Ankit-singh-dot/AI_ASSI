import { prisma } from "./lib/prisma";

async function main() {
    const leads = await prisma.lead.findMany({
        where: { source: "whatsapp" },
        select: { id: true, name: true, phone: true },
        take: 5,
        orderBy: { createdAt: "desc" }
    });
    console.log("Recent WhatsApp Leads:", leads);
}
main().catch(console.error).finally(() => prisma.$disconnect());
