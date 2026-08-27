import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { recordAuditLog } from "@/lib/audit/log";

const schema = z.object({ reason: z.string().trim().min(1, "A reason is required").max(500) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requirePermission("bookings.manage");
    const { id } = await params;
    const body = schema.parse(await request.json());

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return NextResponse.json({ error: `Cannot cancel a ${booking.status.toLowerCase()} booking` }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancelledById: admin.id, cancelReason: body.reason },
    });

    await recordAuditLog({
      actorId: admin.id,
      action: "ADMIN_BOOKING_CANCELLED",
      resourceType: "Booking",
      resourceId: id,
      metadata: { reason: body.reason },
    });

    return NextResponse.json({ booking: { id: updated.id, status: updated.status } });
  } catch (error) {
    return errorResponse(error);
  }
}
