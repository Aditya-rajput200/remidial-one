import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { setAvailabilitySchema } from "@/lib/validation/availability";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireRole("MENTOR");
    const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: user.id } });
    const slots = await prisma.mentorAvailability.findMany({
      where: { mentorId: mentorProfile.id },
      select: { dayOfWeek: true, startHour: true, endHour: true },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });
    return NextResponse.json({ slots });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole("MENTOR");
    const body = setAvailabilitySchema.parse(await request.json());
    const mentorProfile = await prisma.mentorProfile.findUniqueOrThrow({ where: { userId: user.id } });

    await prisma.$transaction([
      prisma.mentorAvailability.deleteMany({ where: { mentorId: mentorProfile.id } }),
      prisma.mentorAvailability.createMany({
        data: body.slots.map((slot) => ({ ...slot, mentorId: mentorProfile.id })),
      }),
    ]);

    const slots = await prisma.mentorAvailability.findMany({
      where: { mentorId: mentorProfile.id },
      select: { dayOfWeek: true, startHour: true, endHour: true },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });
    return NextResponse.json({ slots });
  } catch (error) {
    return errorResponse(error);
  }
}
