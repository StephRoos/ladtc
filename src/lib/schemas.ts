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

/**
 * Zod validation schema for product creation/update (admin)
 */
export const productSchema = z.object({
  name: z.string().min(3, "Le nom du produit doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  sizes: z.array(z.string()),
  stock: z.number().int().nonnegative("Le stock ne peut pas être négatif"),
  image: z.union([z.string().url("URL d'image invalide"), z.literal(""), z.undefined()]),
  sku: z.string().optional(),
  active: z.boolean().optional(),
});

/**
 * Zod validation schema for the checkout shipping form
 */
export const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  shippingEmail: z.string().email("Email invalide"),
  shippingPhone: z.string().min(5, "Le numéro de téléphone est requis"),
  shippingAddress: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  shippingCity: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  shippingZip: z.string().min(2, "Le code postal est requis"),
  shippingCountry: z.string().optional(),
});

/**
 * Zod validation schema for order status updates (admin)
 */
export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type OrderUpdateFormData = z.infer<typeof orderUpdateSchema>;

/**
 * Zod validation schema for user role updates (admin only)
 */
export const roleUpdateSchema = z.object({
  role: z.enum(["MEMBER", "COACH", "COMMITTEE", "ADMIN"]),
});

/**
 * Zod validation schema for activity log filtering
 */
export const activityLogFilterSchema = z.object({
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  skip: z.coerce.number().default(0),
  take: z.coerce.number().default(50),
});

export type RoleUpdateFormData = z.infer<typeof roleUpdateSchema>;
export type ActivityLogFilterData = z.infer<typeof activityLogFilterSchema>;

/**
 * Zod validation schema for blog post creation/update (committee/admin)
 */
export const blogPostSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (lettres minuscules, chiffres et tirets)"),
  content: z.string().min(1, "Le contenu est requis"),
  excerpt: z.string().optional(),
  featuredImageUrl: z.union([
    z.string().url("URL d'image invalide"),
    z.string().startsWith("/images/", "Chemin d'image invalide"),
    z.literal(""),
    z.undefined(),
  ]),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

/**
 * Zod validation schema for event creation/update (committee/admin)
 */
export const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  date: z.string().datetime("Date invalide"),
  location: z.string().min(1, "Le lieu est requis"),
  type: z.enum(["TRAINING", "RACE", "CAMP", "SOCIAL"]),
  difficulty: z.string().optional(),
  maxParticipants: z
    .number()
    .int()
    .positive("Le nombre de places doit être positif")
    .optional()
    .nullable(),
});

export type EventFormData = z.infer<typeof eventSchema>;
