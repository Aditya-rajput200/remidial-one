import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    await requirePermission("users.read");

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalMentors,
      activeMentors,
      upcomingBookings,
      totalBookings,
      cancelledBookings,
      recentSignups,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "MENTOR" } }),
      prisma.mentorProfile.count({ where: { status: "ACTIVE" } }),
      prisma.booking.count({
        where: { scheduledAt: { gte: now, lte: in7Days }, status: { in: ["PENDING", "CONFIRMED"] } },
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalMentors,
      activeMentors,
      upcomingBookings,
      totalBookings,
      cancelledBookings,
      recentSignups,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
