import { clerkMiddleware } from "@clerk/nextjs/server";

// The marketing site is fully public; clerkMiddleware just enables Clerk's
// auth context so the /sign-in and /sign-up pages work. No-ops without keys.
const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default hasClerk ? clerkMiddleware() : () => undefined;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
