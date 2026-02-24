import { z } from "zod";

/**
 * Zod validation schema for the login form
 */
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

/**
 * Zod validation schema for the registration form
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

/**
 * Zod validation schema for the reset password form
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Zod validation schema for member profile updates (self-service)
 */
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

/**
 * Zod validation schema for membership updates (committee/admin)
 */
export const memberUpdateSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"]),
  renewalDate: z.string().datetime().or(z.string().date()),
  paidAt: z.string().datetime().or(z.string().date()).nullable().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  notes: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type MemberUpdateFormData = z.infer<typeof memberUpdateSchema>;
