import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadAccessibleBooking } from "@/lib/bookings/access";
import { createParticipantToken, roomNameForBooking } from "@/lib/video/livekit";
import { recordAuditLog } from "@/lib/audit/log";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Video isn't configured yet. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL." },
        { status: 503 },
      );
    }

    const user = await requireUser();
    const { id } = await params;
    const { booking, isModerator } = await loadAccessibleBooking(id, user);

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "This session was cancelled" }, { status: 400 });
    }

    const roomName = roomNameForBooking(booking.id);
    const token = await createParticipantToken({
      roomName,
      identity: user.id,
      name: user.name,
      asModerator: isModerator,
      avatarUrl: user.avatarUrl,
    });

    if (isModerator) {
      await recordAuditLog({
        actorId: user.id,
        action: "MEETING_JOINED",
        resourceType: "Booking",
        resourceId: booking.id,
        metadata: { asModerator: true },
      });
    }

    return NextResponse.json({
      token,
      serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      roomName,
      isModerator,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
