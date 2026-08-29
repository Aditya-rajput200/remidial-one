import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { errorResponse } from "@/lib/api/respond";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: { select: { name: true, avatarUrl: true } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return errorResponse(error);
  }
}
