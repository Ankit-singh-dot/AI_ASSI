import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const ints = await prisma.integration.updateMany({ 
        where: { platform: 'whatsapp' },
        data: { status: 'connected', metadata: { phoneNumberId: '123456789_phoneId' } } 
    });
    return NextResponse.json(ints);
}
