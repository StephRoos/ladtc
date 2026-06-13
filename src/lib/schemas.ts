import { z } from "zod";
import type { EventType } from "@/types";

/**
 * Predefined blog post categories.
 * Categories with a non-null EventType mapping will be treated as events
 * when the post has an eventDate.
 */
export const BLOG_CATEGORIES = [
  "Actualité",
  "Stage",
  "Course",
  "Entraînement",
  "Social",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/**
 * Maps blog categories to their corresponding EventType.
 * A null value means the category is not event-related.
 */
export const CATEGORY_TO_EVENT_TYPE: Record<BlogCategory, EventType | null> = {
  "Actualité": null,
  "Stage": "CAMP",
  "Course": "RACE",
  "Entraînement": "TRAINING",
  "Social": "SOCIAL",
};

/**
 * Blog categories that qualify as events.
 */
export const EVENT_CATEGORIES = BLOG_CATEGORIES.filter(
  (c) => CATEGORY_TO_EVENT_TYPE[c] !== null
);

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

/**
 * Zod validation schema for the new password form (after reset email)
 */
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

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
  season: z.string().regex(/^\d{4}-\d{4}$/, "Format saison invalide (ex. 2025-2026)").nullable().optional(),
  paidAt: z.string().datetime().or(z.string().date()).nullable().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  notes: z.string().optional(),
});

/**
 * Zod validation schema for creating a new member (committee/admin)
 */
export const memberCreateSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE", "EXPIRED"]),
  season: z.string().regex(/^\d{4}-\d{4}$/, "Format saison invalide (ex. 2025-2026)").nullable().optional(),
  paidAt: z.string().datetime().or(z.string().date()).nullable().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  notes: z.string().optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type MemberUpdateFormData = z.infer<typeof memberUpdateSchema>;
export type MemberCreateFormData = z.infer<typeof memberCreateSchema>;

/**
 * Zod validation schema for product creation/update (admin).
 * Stock is no longer global — managed per size via productStockUpdateSchema.
 */
export const productSchema = z.object({
  name: z.string().min(3, "Le nom du produit doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  sizes: z.array(z.string()),
  image: z.union([z.string().url("URL d'image invalide"), z.literal(""), z.undefined()]),
  sku: z.string().optional(),
  active: z.boolean().optional(),
});

/**
 * Zod validation schema for per-size stock updates (admin).
 * Body: { stock: [{ size: "M", quantity: 3 }, ...] }
 */
export const productStockUpdateSchema = z.object({
  stock: z
    .array(
      z.object({
        size: z.string().min(1, "Taille requise"),
        quantity: z.number().int().nonnegative("Le stock ne peut pas être négatif"),
      })
    )
    .min(1, "Au moins une entrée de stock requise"),
});

/**
 * Zod validation schema for the checkout form.
 * Delivery method gates whether shipping fields are required:
 * - HOME_DELIVERY: shipping fields validated (member must provide an address)
 * - CLUB_PICKUP: shipping fields ignored (member picks up the order at the club)
 */
export const checkoutSchema = z
  .object({
    deliveryMethod: z.enum(["HOME_DELIVERY", "CLUB_PICKUP"]),
    shippingName: z.string().optional(),
    shippingEmail: z.string().optional(),
    shippingPhone: z.string().optional(),
    shippingAddress: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingZip: z.string().optional(),
    shippingCountry: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "HOME_DELIVERY") return;

    const requiredFields: Array<{ key: keyof typeof data; label: string; min: number }> = [
      { key: "shippingName", label: "Le nom doit contenir au moins 2 caractères", min: 2 },
      { key: "shippingPhone", label: "Le numéro de téléphone est requis", min: 5 },
      { key: "shippingAddress", label: "L'adresse doit contenir au moins 5 caractères", min: 5 },
      { key: "shippingCity", label: "La ville doit contenir au moins 2 caractères", min: 2 },
      { key: "shippingZip", label: "Le code postal est requis", min: 2 },
    ];

    for (const { key, label, min } of requiredFields) {
      const value = data[key];
      if (typeof value !== "string" || value.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: label,
        });
      }
    }

    const email = data.shippingEmail;
    if (typeof email !== "string" || !email.includes("@")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shippingEmail"],
        message: "Email invalide",
      });
    }
  });

/**
 * Zod validation schema for order status updates (admin)
 */
export const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "BATCHED", "ORDERED", "RECEIVED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductStockUpdateFormData = z.infer<typeof productStockUpdateSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type OrderUpdateFormData = z.infer<typeof orderUpdateSchema>;

/**
 * Zod validation schema for user role updates (admin only)
 */
export const roleUpdateSchema = z
  .object({
    // ADMIN is deprecated (the committee manages everything) and cannot be assigned.
    role: z.enum(["MEMBER", "COMMITTEE"]),
    committeeRole: z
      .string()
      .trim()
      .max(100, "La fonction ne peut pas dépasser 100 caractères")
      .nullable()
      .optional(),
  })
  .refine(
    (d) => d.role === "COMMITTEE" || !d.committeeRole,
    { message: "La fonction ne peut être définie que pour le rôle Comité", path: ["committeeRole"] },
  );

/**
 * Common committee role suggestions shown in the UI.
 */
export const COMMITTEE_ROLE_SUGGESTIONS = [
  "Président",
  "Vice-Président",
  "Trésorier",
  "Secrétaire",
  "Communication",
] as const;

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
    // Local images: bundled assets (/images/) or uploads (/uploads/, gallery + blog)
    z.string().startsWith("/images/", "Chemin d'image invalide"),
    z.string().startsWith("/uploads/", "Chemin d'image invalide"),
    z.literal(""),
    z.undefined(),
  ]),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/).optional().nullable(),
  eventLocation: z.string().optional().nullable(),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;

/**
 * Zod validation schema for event creation/update (committee/admin)
 */
export const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Date invalide"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Date de fin invalide").optional().nullable(),
  location: z.string().min(1, "Le lieu est requis"),
  type: z.enum(["TRAINING", "RACE", "CAMP", "SOCIAL"]),
  difficulty: z.string().optional(),
  maxParticipants: z
    .number()
    .int()
    .positive("Le nombre de places doit être positif")
    .optional()
    .nullable(),
  image: z.union([
    z.string().url("URL d'image invalide"),
    z.string().startsWith("/images/", "Chemin d'image invalide"),
    z.literal(""),
    z.undefined(),
  ]).optional().nullable(),
});

export type EventFormData = z.infer<typeof eventSchema>;

/**
 * Zod validation schema for gallery photo metadata
 */
export const galleryPhotoSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type GalleryPhotoFormData = z.infer<typeof galleryPhotoSchema>;
