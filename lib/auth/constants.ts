// Shared between lib/auth/session.server.ts and proxy.ts. Kept dependency-free
// so proxy.ts doesn't have to pull in the Prisma client / server-only code
// just to read a cookie name.
export const SESSION_COOKIE = "r1_session";
