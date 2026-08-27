This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database & auth setup

This project uses Prisma + PostgreSQL for real accounts/sessions/RBAC (see `prisma/schema.prisma`).

1. Copy `.env.example` to `.env` and set `DATABASE_URL`. For local dev without a hosted database, run `npx prisma dev` in a separate terminal — it starts a local Postgres and prints a `DATABASE_URL` you can paste in. For production, use your Neon/Supabase connection string.
2. Apply the schema: `npm run prisma:migrate` (dev) or `npm run prisma:deploy` (prod, no prompts).
3. Seed permissions/roles and bootstrap the first Super Admin: set `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD` in `.env`, then `npm run db:seed`. Public signup can only create STUDENT/MENTOR/PARENT accounts — this is the only way to create an ADMIN/SUPER_ADMIN account.
4. `npm run dev` as usual.

Re-run `npm run db:seed` any time `lib/auth/permissions.ts` changes — it keeps `RolePermission` in sync with that file.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
