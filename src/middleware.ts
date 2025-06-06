import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create-event(.*)',
  '/edit-event(.*)',
  '/api/events(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;
  
  // Allow public API endpoints without authentication
  if (url.includes('/api/events/') && url.endsWith('/public')) {
    return;
  }
  
  // Allow registration endpoint without authentication
  if (url.startsWith('/api/register')) {
    return;
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
