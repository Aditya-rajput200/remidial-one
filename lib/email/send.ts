import "server-only";
import { getResendClient } from "@/lib/email/client";

const DEFAULT_FROM = "Remedial One <onboarding@resend.dev>";

export type SendEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

/**
 * Sends a transactional email via Resend. Never throws — a missing
 * RESEND_API_KEY or a provider error is logged and returned as a typed
 * failure so callers (signup, note upload, etc.) can treat email as
 * best-effort and never fail their main action over it.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.info(`[email] RESEND_API_KEY not set — skipping send. to=${to} subject="${subject}"`);
    return { ok: false, reason: "not_configured" };
  }

  try {
    const { error } = await client.emails.send({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] Resend send failed", error);
      return { ok: false, reason: "send_failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] Resend send threw", error);
    return { ok: false, reason: "send_failed" };
  }
}
