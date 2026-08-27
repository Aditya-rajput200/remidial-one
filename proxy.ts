import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Cheap, cookie-presence-only gate for protected areas. This intentionally
// does NOT hit the database (Proxy runs in front of every matched request,
// and Next.js recommends against relying on it as the sole authorization
// boundary) — full session validation, role checks, and permission checks
// happen in each page/route handler via lib/auth/rbac.ts.
const PROTECTED_PREFIXES = ["/student", "/mentor", "/parent", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/student/:path*", "/mentor/:path*", "/parent/:path*", "/admin/:path*"],
};
