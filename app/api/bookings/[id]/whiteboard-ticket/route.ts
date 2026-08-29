import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { loadAccessibleWhiteboard } from "@/lib/whiteboard/access";
import { mintWhiteboardTicket } from "@/lib/whiteboard/ticket";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!process.env.WHITEBOARD_WS_TICKET_SECRET || !process.env.NEXT_PUBLIC_WHITEBOARD_WS_URL) {
      return NextResponse.json(
        {
          error:
            "The whiteboard isn't configured yet. Set WHITEBOARD_WS_TICKET_SECRET and NEXT_PUBLIC_WHITEBOARD_WS_URL.",
        },
        { status: 503 },
      );
    }

    const user = await requireUser();
    const { id } = await params;
    const { booking, whiteboard, isModerator, isMentor, permission } = await loadAccessibleWhiteboard(id, user);

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "This session was cancelled" }, { status: 400 });
    }

    const ticket = await mintWhiteboardTicket({
      userId: user.id,
      whiteboardId: whiteboard.id,
      isModerator,
      isMentor,
      permission,
    });

    return NextResponse.json({
      ticket,
      wsUrl: process.env.NEXT_PUBLIC_WHITEBOARD_WS_URL,
      whiteboard: {
        id: whiteboard.id,
        isLocked: whiteboard.isLocked,
        defaultPermission: whiteboard.defaultPermission,
      },
      pages: whiteboard.pages.map((page) => ({
        id: page.id,
        name: page.name,
        position: page.position,
        background: page.background,
      })),
      permission,
      isModerator,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
