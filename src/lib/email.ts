import type { MemberWithMembership, Order } from "@/types";
import {
  welcomeEmailTemplate,
  renewalReminderTemplate,
  orderConfirmationTemplate,
  orderStatusTemplate,
} from "./email-templates";

const FROM_EMAIL = "LADTC <noreply@ladtc.be>";
const COMMITTEE_EMAIL = "bureau@ladtc.be";

/**
 * Sends an email using Resend. Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body content
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[Email fallback] RESEND_API_KEY not set — logging email instead of sending");
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] HTML length: ${html.length} chars`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[Email] Failed to send email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Sends a renewal reminder email to a member.
 * Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param member - Member with membership data
 */
export async function sendRenewalReminder(member: MemberWithMembership): Promise<void> {
  const membership = member.membership;
  if (!membership) return;

  const renewalDate = membership.renewalDate.toLocaleDateString("fr-BE");
  const daysUntil = Math.ceil(
    (membership.renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const subject =
    daysUntil > 0
      ? "Rappel de renouvellement LADTC"
      : "Votre cotisation LADTC est à renouveler";

  const name = member.name ?? member.email;
  const html = renewalReminderTemplate(name, renewalDate, membership.amount);

  await sendEmail(member.email, subject, html);
}

/**
 * Sends a welcome email to a newly registered user.
 * Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param user - Newly registered user with name and email
 */
export async function sendWelcomeEmail(user: { name: string | null; email: string }): Promise<void> {
  const name = user.name ?? user.email;
  const subject = "Bienvenue chez LADTC !";
  const html = welcomeEmailTemplate(name);

  await sendEmail(user.email, subject, html);
}

/**
 * Sends an order confirmation email to the buyer.
 * Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param order - The complete order object with items and user
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const subject = `Confirmation de commande LADTC #${order.id.slice(-8).toUpperCase()}`;
  const html = orderConfirmationTemplate(order);

  await sendEmail(order.shippingEmail, subject, html);
}

/**
 * Sends an order status update email (e.g. shipped, delivered).
 * Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param order - The complete order object
 * @param status - New order status string
 */
export async function sendOrderStatusUpdate(order: Order, status: string): Promise<void> {
  const statusLabels: Record<string, string> = {
    CONFIRMED: "confirmée",
    SHIPPED: "expédiée",
    DELIVERED: "livrée",
    CANCELLED: "annulée",
  };
  const label = statusLabels[status] ?? status.toLowerCase();
  const subject = `Votre commande LADTC a été ${label} — #${order.id.slice(-8).toUpperCase()}`;
  const html = orderStatusTemplate(order, status);

  await sendEmail(order.shippingEmail, subject, html);
}

// Export committee contact for convenience
export { COMMITTEE_EMAIL };
