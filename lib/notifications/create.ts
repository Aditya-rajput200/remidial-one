import "server-only";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send";
import { appUrl } from "@/lib/email/app-url";
import { notificationEmail } from "@/lib/email/templates";
import type { NotificationType } from "@/lib/generated/prisma/enums";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  /** App-relative path (e.g. "/mentor/onboarding") — turned absolute for email. */
  linkUrl?: string;
  /** Also send an email copy (best-effort). Defaults to false. */
  email?: boolean;
};

/**
 * Writes an in-app notification and optionally emails a copy. Best-effort:
 * never throws, so a notification failure can't break the action that
 * triggered it (mirrors lib/email/send.ts and lib/audit/log.ts usage).
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl,
      },
    });
  } catch (error) {
    console.error("[notifications] failed to create in-app notification", error);
  }

  if (!input.email) return;

  try {
    const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, name: true } });
    if (!user) return;
    const { subject, html } = notificationEmail({
      name: user.name,
      title: input.title,
      body: input.body,
      actionUrl: input.linkUrl ? appUrl(input.linkUrl) : undefined,
    });
    await sendEmail({ to: user.email, subject, html });
  } catch (error) {
    console.error("[notifications] failed to send notification email", error);
  }
}

/** Fan-out helper: notify every user holding a given permission key. */
export async function notifyPermissionHolders(
  permissionKey: string,
  input: Omit<CreateNotificationInput, "userId">,
): Promise<void> {
  try {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { permission: { key: permissionKey } },
      select: { role: true },
    });
    const roles = rolePerms.map((r) => r.role);
    const grants = await prisma.userPermission.findMany({
      where: { permission: { key: permissionKey }, effect: "GRANT" },
      select: { userId: true },
    });

    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          roles.length ? { role: { in: roles } } : { id: "__none__" },
          grants.length ? { id: { in: grants.map((g) => g.userId) } } : { id: "__none__" },
        ],
      },
      select: { id: true },
    });

    await Promise.all(users.map((u) => createNotification({ ...input, userId: u.id })));
  } catch (error) {
    console.error("[notifications] permission-holder fan-out failed", error);
  }
}
