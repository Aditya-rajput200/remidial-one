import { z } from "zod";

// Roles a visitor can self-register as. ADMIN/SUPER_ADMIN accounts are never
// created through public signup — they're provisioned via prisma/seed.ts or
// a future admin-invite flow.
export const PUBLIC_SIGNUP_ROLES = ["STUDENT", "MENTOR", "PARENT"] as const;

const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128)
  .regex(/[a-zA-Z]/, "Password must include at least one letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email().max(255),
  password: passwordSchema,
  role: z.enum(PUBLIC_SIGNUP_ROLES),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});
