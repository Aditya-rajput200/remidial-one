import "server-only";
import { Resend } from "resend";

let client: Resend | null | undefined;

/**
 * Lazily constructs the Resend client from RESEND_API_KEY — returns null when
 * unset so callers (see send.ts) can skip sending gracefully, same pattern as
 * NVIDIA_API_KEY in lib/ai/nvidia.ts.
 */
export function getResendClient(): Resend | null {
  if (client !== undefined) return client;
  const apiKey = process.env.RESEND_API_KEY;
  client = apiKey ? new Resend(apiKey) : null;
  return client;
}
