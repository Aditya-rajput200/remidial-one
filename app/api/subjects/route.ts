import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, shortDescription: true, icon: true },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    return errorResponse(error);
  }
}
