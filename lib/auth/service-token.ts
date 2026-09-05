import "server-only";
import { timingSafeEqual } from "crypto";
import { UnauthenticatedError } from "@/lib/auth/errors";

/**
 * Verifies a bearer service token for server-to-server calls that have no
 * user session — currently only the internal CRM (see Crm/my-app), which is
 * a separate app/database and can't hold a remidial-one session cookie.
 * Constant-time comparison to avoid a timing side-channel, same pattern as
 * the CRM's own webhook signature check (lib/webhooks/verify.ts there).
 */
export function requireServiceToken(authHeader: string | null): void {
  const expected = process.env.CRM_SERVICE_TOKEN;
  if (!expected) throw new UnauthenticatedError("Service integration is not configured");

  const provided = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!provided) throw new UnauthenticatedError("Missing service token");

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  const valid = expectedBuf.length === providedBuf.length && timingSafeEqual(expectedBuf, providedBuf);
  if (!valid) throw new UnauthenticatedError("Invalid service token");
}
