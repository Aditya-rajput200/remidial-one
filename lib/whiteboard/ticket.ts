import "server-only";
import { SignJWT } from "jose";
import type { WhiteboardPermissionLevel } from "@/lib/generated/prisma/enums";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(requireEnv("WHITEBOARD_WS_TICKET_SECRET"));
}

export type WhiteboardTicketClaims = {
  userId: string;
  whiteboardId: string;
  isModerator: boolean;
  isMentor: boolean;
  permission: WhiteboardPermissionLevel;
};

/**
 * Mints a short-lived signed ticket the browser presents to the standalone
 * whiteboard WS server (in /Server) to open a socket. Kept separate from
 * the session cookie because the cookie is httpOnly/SameSite=lax and isn't
 * meant to be read by client JS or sent cross-origin to a separate ws://
 * host — this keeps the WS server's trust boundary purpose-built with its
 * own single-purpose secret rather than reusing the cookie/session-hash
 * scheme's internals. 60s TTL is tight enough that no server-side
 * single-use tracking is needed for this pass.
 */
export async function mintWhiteboardTicket(claims: WhiteboardTicketClaims): Promise<string> {
  return new SignJWT({
    whiteboardId: claims.whiteboardId,
    isModerator: claims.isModerator,
    isMentor: claims.isMentor,
    permission: claims.permission,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(getSecretKey());
}
