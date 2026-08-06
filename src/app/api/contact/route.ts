import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  newsletter: z.boolean().optional(),
});

/**
 * POST /api/contact
 * Forwards the submitted contact form to the committee mailbox.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Anti-spam: max 5 messages per IP per hour (public unauthenticated endpoint)
  if (isRateLimited(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      {
        success: false,
        message: "Trop de messages envoyés. Veuillez réessayer plus tard.",
      },
      { status: 429 }
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await sendContactMessage(parsed.data);

    return NextResponse.json({
      success: true,
      message: "Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Une erreur est survenue. Veuillez réessayer plus tard.",
      },
      { status: 500 }
    );
  }
}
