import { clerkMiddleware } from '@clerk/nextjs/server';

// All routes are public — we use our own JWT auth for backend protection.
// Clerk is only used for email OTP verification during registration.
export default clerkMiddleware();

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
