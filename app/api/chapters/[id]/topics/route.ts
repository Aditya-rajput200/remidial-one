import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { errorResponse } from "@/lib/api/respond";
import { createTopicSchema } from "@/lib/validation/question";
import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const topics = await prisma.topic.findMany({ where: { chapterId: id }, orderBy: { order: "asc" } });
    return NextResponse.json({ topics });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole("MENTOR", "ADMIN", "SUPER_ADMIN");
    const { id } = await params;
    const body = createTopicSchema.parse(await request.json());

    const count = await prisma.topic.count({ where: { chapterId: id } });
    const topic = await prisma.topic.create({
      data: { chapterId: id, name: body.name, order: count, createdById: user.id },
    });
    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A topic with this name already exists for this chapter." }, { status: 409 });
    }
    return errorResponse(error);
  }
}
