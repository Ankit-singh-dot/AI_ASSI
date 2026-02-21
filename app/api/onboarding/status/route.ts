import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Internal API to check onboarding status.
 * Called from middleware (can't use Prisma directly in edge runtime).
 * GET /api/onboarding/status?clerkId=xxx
 */
export async function GET(req: NextRequest) {
    // Verify this is an internal call
    const secret = req.headers.get("x-internal-secret");
    if (secret !== process.env.CLERK_SECRET_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkId = req.nextUrl.searchParams.get("clerkId");
    if (!clerkId) {
        return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
            select: { onboardingComplete: true },
        });

        // If user doesn't exist yet (webhook hasn't fired), let them through
        if (!user) {
            return NextResponse.json({ complete: true });
        }

        return NextResponse.json({ complete: user.onboardingComplete });
    } catch (error) {
        console.error("Onboarding status check error:", error);
        return NextResponse.json({ complete: true }); // Fail open
    }
}
