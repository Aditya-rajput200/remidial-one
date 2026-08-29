import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadAccessibleBooking } from "@/lib/bookings/access";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("join") }),
  z.object({ action: z.literal("leave") }),
]);

/**
 * Records actual (not scheduled) session timing. Called from the room page
 * on LiveKit connect/disconnect. A reconnect opens a fresh attendance row
 * rather than reusing the old one, so a participant's full in/out history is
 * preserved — actualStartedAt/actualEndedAt on Booking are just the
 * first-join/last-leave summary derived from those rows.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id: bookingId } = await params;
    const body = bodySchema.parse(await request.json());
    const { booking } = await loadAccessibleBooking(bookingId, user);

    if (body.action === "join") {
      const now = new Date();
      await prisma.$transaction([
        prisma.sessionAttendance.create({ data: { bookingId, userId: user.id, joinedAt: now } }),
        prisma.booking.update({
          where: { id: bookingId },
          data: booking.actualStartedAt ? {} : { actualStartedAt: now },
        }),
      ]);
      return NextResponse.json({ ok: true });
    }

    // leave
    const openAttendance = await prisma.sessionAttendance.findFirst({
      where: { bookingId, userId: user.id, leftAt: null },
      orderBy: { joinedAt: "desc" },
    });
    const now = new Date();
    await prisma.$transaction([
      ...(openAttendance
        ? [prisma.sessionAttendance.update({ where: { id: openAttendance.id }, data: { leftAt: now } })]
        : []),
      prisma.booking.update({ where: { id: bookingId }, data: { actualEndedAt: now } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
