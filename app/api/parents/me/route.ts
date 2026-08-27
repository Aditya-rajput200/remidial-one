import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireRole("PARENT");

    const profile = await prisma.parentProfile.findUniqueOrThrow({
      where: { userId: user.id },
      include: {
        user: { select: { name: true, email: true } },
        children: {
          where: { status: "APPROVED" },
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    return NextResponse.json({
      profile: {
        name: profile.user.name,
        email: profile.user.email,
        children: profile.children.map((link) => ({
          studentId: link.student.id,
          name: link.student.user.name,
          grade: link.student.grade ?? "",
        })),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
