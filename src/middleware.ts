import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require Clerk authentication
const isPublicRoute = createRouteMatcher([
    '/',
    '/login(.*)',
    '/register(.*)',
    '/admin/login(.*)',
    '/categories(.*)',
    '/community(.*)',
    '/community-help(.*)',
    '/community-voting(.*)',
    '/civic-education(.*)',
    '/civic-simulator(.*)',
    '/heatmap(.*)',
    '/map(.*)',
    '/nearby-services(.*)',
    '/analytics(.*)',
    '/leaderboard(.*)',
    '/sos(.*)',
    '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
