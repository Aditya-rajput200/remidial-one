import { randomBytes, createHash } from "node:crypto";

/**
 * Generates a high-entropy opaque token. The raw value is only ever sent to
 * the client (cookie, email link) — persist `hashToken(raw)` instead of the
 * raw value so a database leak can't be replayed as a live credential.
 */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
