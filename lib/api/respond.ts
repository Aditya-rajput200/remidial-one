import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { UnauthenticatedError, ForbiddenError } from "@/lib/auth/errors";
import { RateLimitedError } from "@/lib/security/rate-limit";

/**
 * Converts a thrown error from a route handler into a safe JSON response.
 * Never leaks internal error messages for unexpected (500) failures.
 */
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthenticatedError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request", issues: error.issues.map((i) => ({ path: i.path, message: i.message })) },
      { status: 400 },
    );
  }
  if (error instanceof RateLimitedError) {
    return NextResponse.json({ error: error.message }, { status: 429 });
  }

  console.error(error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
