import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session.server";
import { toPublicUser } from "@/lib/auth/public-user";
import { errorResponse } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (error) {
    return errorResponse(error);
  }
}
