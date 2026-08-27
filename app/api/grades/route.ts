import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, range: true, tagline: true },
    });
    return NextResponse.json({ grades });
  } catch (error) {
    return errorResponse(error);
  }
}
