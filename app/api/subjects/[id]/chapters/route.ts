import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { createChapterSchema } from "@/lib/validation/question";
import { Prisma } from "@/lib/generated/prisma/client";

/** Chapters are a shared catalog (not per-mentor owned) — any mentor/admin can list or add one inline while building a test. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: id },
      orderBy: { order: "asc" },
      include: { topics: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json({ chapters });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const body = createChapterSchema.parse(await request.json());

    const count = await prisma.chapter.count({ where: { subjectId: id } });
    const chapter = await prisma.chapter.create({
      data: { subjectId: id, name: body.name, order: count, createdById: user.id },
    });
    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A chapter with this name already exists for this subject." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
