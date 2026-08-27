import "dotenv/config";
import { prisma } from "../lib/db/prisma";
import { ALL_PERMISSION_KEYS, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../lib/auth/permissions";
import { hashPassword } from "../lib/auth/password";
import { subjects as subjectContent } from "../lib/content/subjects";
import { classBands } from "../lib/content/classes";
import type { Role } from "../lib/generated/prisma/enums";

async function seedPermissions() {
  for (const key of ALL_PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: { description: PERMISSIONS[key] },
      create: { key, description: PERMISSIONS[key] },
    });
  }
  console.log(`Seeded ${ALL_PERMISSION_KEYS.length} permissions.`);
}

async function seedRolePermissions() {
  const permissions = await prisma.permission.findMany();
  const permissionIdByKey = new Map(permissions.map((p) => [p.key, p.id]));

  for (const [role, keys] of Object.entries(DEFAULT_ROLE_PERMISSIONS) as [Role, typeof ALL_PERMISSION_KEYS][]) {
    const desiredIds = new Set(keys.map((key) => permissionIdByKey.get(key)!));

    // Keep RolePermission in sync with lib/auth/permissions.ts: drop grants
    // that are no longer in the default list, add ones that are new.
    const existing = await prisma.rolePermission.findMany({ where: { role } });
    const existingIds = new Set(existing.map((rp) => rp.permissionId));

    const toRemove = existing.filter((rp) => !desiredIds.has(rp.permissionId));
    if (toRemove.length > 0) {
      await prisma.rolePermission.deleteMany({ where: { id: { in: toRemove.map((rp) => rp.id) } } });
    }

    const toAdd = [...desiredIds].filter((id) => !existingIds.has(id));
    if (toAdd.length > 0) {
      await prisma.rolePermission.createMany({
        data: toAdd.map((permissionId) => ({ role, permissionId })),
      });
    }
  }
  console.log("Synced role -> permission defaults.");
}

async function seedSuperAdmin() {
  const email = (process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@remedial.one").toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super admin already exists: ${email}`);
    return;
  }

  if (!password) {
    console.warn(
      "SEED_SUPER_ADMIN_PASSWORD not set — skipping super admin creation. " +
        "Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env and re-run the seed to bootstrap one.",
    );
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      adminProfile: { create: {} },
    },
  });
  console.log(`Created super admin: ${email} — change this password after first login.`);
}

// Mirrors lib/content/subjects.ts / lib/content/classes.ts into the database
// so mentors/bookings can reference a real Subject/Grade id. The marketing
// site keeps reading the static files directly for now (see the Subject
// model's doc comment in schema.prisma) — this just keeps the two in sync
// until CMS management (Phase 9) makes the DB the single source of truth.
async function seedSubjectsAndGrades() {
  for (const subject of subjectContent) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name, shortDescription: subject.shortDescription, icon: subject.icon },
      create: {
        slug: subject.slug,
        name: subject.name,
        shortDescription: subject.shortDescription,
        icon: subject.icon,
      },
    });
  }

  for (const band of classBands) {
    await prisma.grade.upsert({
      where: { slug: band.slug },
      update: {
        name: band.name,
        range: band.range,
        tagline: band.tagline,
        subjects: { set: band.subjectSlugs.map((slug) => ({ slug })) },
      },
      create: {
        slug: band.slug,
        name: band.name,
        range: band.range,
        tagline: band.tagline,
        subjects: { connect: band.subjectSlugs.map((slug) => ({ slug })) },
      },
    });
  }
  console.log(`Seeded ${subjectContent.length} subjects and ${classBands.length} grades.`);
}

async function main() {
  await seedPermissions();
  await seedRolePermissions();
  await seedSuperAdmin();
  await seedSubjectsAndGrades();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
