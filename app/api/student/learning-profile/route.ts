import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await requireRole("STUDENT");
    const studentProfile = await prisma.studentProfile.findUniqueOrThrow({ where: { userId: user.id } });
    const profile = await prisma.studentLearningProfile.findUnique({ where: { studentId: studentProfile.id } });
    return NextResponse.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
