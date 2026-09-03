import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { parsePagination } from "@/lib/api/pagination";
import { errorResponse } from "@/lib/api/respond";
import { teacherLeadSchema } from "@/lib/validation/teacher";
import { notifyPermissionHolders } from "@/lib/notifications/create";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { TeacherLeadStatus } from "@/lib/generated/prisma/enums";

// Staff-only — teacher leads are entered by a counselor/admin after first
// contact (there is no public application form). See app/(marketing)/become-a-mentor,
// which now just points to /contact.
export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission("teacher_leads.manage");
    const body = teacherLeadSchema.parse(await request.json());

    const lead = await prisma.teacherLead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        whatsapp: body.whatsapp,
        city: body.city,
        state: body.state,
        source: "admin",
        interestedSubjects: body.interestedSubjects,
        interestedGrades: body.interestedGrades,
        message: body.message,
        assignedToId: actor.id,
      },
    });

    await notifyPermissionHolders("teacher_leads.read", {
      type: "NEW_TEACHER_LEAD",
      title: `New teacher lead: ${body.name}`,
      body: body.interestedSubjects.length ? `Interested in ${body.interestedSubjects.join(", ")}` : undefined,
      linkUrl: `/admin/teacher-leads?id=${lead.id}`,
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("teacher_leads.read");
    const { searchParams } = request.nextUrl;
    const { limit, offset } = parsePagination(searchParams);
    const status = searchParams.get("status") ?? undefined;
    const q = searchParams.get("q")?.trim();
    const dueOnly = searchParams.get("dueOnly") === "1";

    const where: Prisma.TeacherLeadWhereInput = {
      ...(status ? { status: status as TeacherLeadStatus } : {}),
      ...(dueOnly ? { nextFollowUpAt: { lte: new Date() } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [leads, total] = await prisma.$transaction([
      prisma.teacherLead.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true } },
          mentorProfile: { select: { id: true } },
          _count: { select: { activities: true } },
        },
        orderBy: dueOnly ? { nextFollowUpAt: "asc" } : { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.teacherLead.count({ where }),
    ]);

    return NextResponse.json({ leads, total, limit, offset });
  } catch (error) {
    return errorResponse(error);
  }
}
