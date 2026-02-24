import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  newsletter: z.boolean().optional(),
});

/**
 * POST /api/contact
 * Handle contact form submission (logs for now, email sending in future)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message, newsletter } = parsed.data;

    // Log the contact form data (email sending to be implemented)
    console.log("Contact form submission:", {
      name,
      email,
      subject,
      message,
      newsletter: newsletter ?? false,
      timestamp: new Date().toISOString(),
    });

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
