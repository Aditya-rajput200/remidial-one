import "server-only";
import { createHmac } from "crypto";

export type CrmWebhookResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };

export type WebsiteLeadWebhookPayload = {
  formName: string;
  studentName: string;
  parentName?: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  studentEmail?: string;
  parentPhone?: string;
  className?: string;
  board?: string;
  subjectsInterested?: string[];
  learningRequirements?: string;
  city?: string;
  preferredContactTime?: string;
  budget?: string;
  preferredTeacherGender?: string;
  preferredLanguage?: string;
  source?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  submittedAt?: string;
};

/**
 * Forwards a public-website lead-generation form submission to the internal
 * CRM (a separate app/database — see Crm/my-app) as a signed webhook. Never
 * throws — the CRM being unreachable/unconfigured must never fail the
 * website's own form submission, same best-effort pattern as sendEmail (see
 * lib/email/send.ts). The CRM logs every call (valid or not) to WebhookEvent
 * and is itself idempotent on retries via duplicate-lead detection, so this
 * is safe to call again from the caller's own retry logic if ever added.
 */
export async function forwardLeadToCrm(payload: WebsiteLeadWebhookPayload): Promise<CrmWebhookResult> {
  const crmUrl = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.WEBSITE_WEBHOOK_SECRET;

  if (!crmUrl || !secret) {
    console.info("[crm-webhook] CRM_WEBHOOK_URL/WEBSITE_WEBHOOK_SECRET not set — skipping forward.", {
      formName: payload.formName,
    });
    return { ok: false, reason: "not_configured" };
  }

  const body = JSON.stringify(payload);
  const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  try {
    const response = await fetch(crmUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature },
      body,
    });
    if (!response.ok) {
      console.error("[crm-webhook] CRM rejected the webhook", response.status, await response.text());
      return { ok: false, reason: "send_failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("[crm-webhook] Forward to CRM threw", error);
    return { ok: false, reason: "send_failed" };
  }
}
