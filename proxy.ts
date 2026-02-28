import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)"
]);

const isOnboardingRoute = createRouteMatcher([
    "/onboarding(.*)"
]);

const handler = clerkMiddleware(async (auth, req) => {
    // Handle CORS preflight requests globally
    if (req.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
            },
        });
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    if (isOnboardingRoute(req)) {
        await auth.protect();
    }

    // After auth, check if user needs onboarding
    const { userId } = await auth();

    if (userId && isProtectedRoute(req)) {
        // Check onboarding status via API
        try {
            const baseUrl = req.nextUrl.origin;
            const res = await fetch(`${baseUrl}/api/onboarding/status?clerkId=${userId}`, {
                headers: { "x-internal-secret": process.env.CLERK_SECRET_KEY || "" },
            });
            if (res.ok) {
                const data = await res.json();
                if (!data.complete) {
                    return NextResponse.redirect(new URL("/onboarding", req.url));
                }
            }
        } catch (e) {
            // If check fails, let them through — don't block
            console.error("Onboarding check failed:", e);
        }
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
    return response;
});

// Next.js 16: export as `proxy` instead of `default`/`middleware`
export const proxy = handler;

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
