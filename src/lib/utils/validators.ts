import { z } from "zod";
import { Role } from "@prisma/client";

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2, "Full name is required"),
    role: z.enum([Role.RESIDENT, Role.GUARD], {
      error: "Role must be RESIDENT or GUARD",
    }),
    unitNumber: z.string().optional(),
  })
  .refine(
    (data) => data.role !== Role.RESIDENT || !!data.unitNumber?.trim(),
    { message: "Unit number is required for residents", path: ["unitNumber"] }
  );

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerVisitorSchema = z.object({
  fullName: z.string().min(2, "Visitor name is required"),
  idPictureUrl: z.string().url("A valid ID picture URL is required"),
  email: z.string().email("A valid email is required"),
  purpose: z.string().min(2, "Purpose of visit is required"),
  targetUnit: z.string().min(1, "Target unit/room is required"),
  expectedArrival: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date/time"),
});

export const updateVisitorSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  purpose: z.string().min(2).optional(),
  targetUnit: z.string().min(1).optional(),
  expectedArrival: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date/time")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RegisterVisitorInput = z.infer<typeof registerVisitorSchema>;
export type UpdateVisitorInput = z.infer<typeof updateVisitorSchema>;
