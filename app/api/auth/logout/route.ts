import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth/session.server";
import { errorResponse } from "@/lib/api/respond";

export async function POST() {
  try {
    await destroyCurrentSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
