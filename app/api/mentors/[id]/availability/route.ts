import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const mentor = await prisma.mentorProfile.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true } });
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const slots = await prisma.mentorAvailability.findMany({
      where: { mentorId: id },
      select: { dayOfWeek: true, startHour: true, endHour: true },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });
    return NextResponse.json({ slots });
  } catch (error) {
    return errorResponse(error);
  }
}
