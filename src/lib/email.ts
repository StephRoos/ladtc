import type { MemberWithMembership, Order } from "@/types";
import { getCurrentSeason } from "@/lib/membership";
import {
  welcomeEmailTemplate,
  renewalReminderTemplate,
  orderConfirmationTemplate,
  orderStatusTemplate,
  orderReadyForPaymentTemplate,
  paymentConfirmationTemplate,
  membershipPaymentConfirmationTemplate,
  contactFormTemplate,
} from "./email-templates";

const FROM_EMAIL = "LADTC <noreply@ladtc.be>";
const COMMITTEE_EMAIL = "bureau@ladtc.be";

interface SendEmailOptions {
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

/**
 * Sends an email using Resend. Falls back to console.log if RESEND_API_KEY is not set.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body content
 * @param options - Optional extras (replyTo, attachments)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: SendEmailOptions = {},
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[Email fallback] RESEND_API_KEY not set — logging email instead of sending");
    console.log(`[Email] To: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    if (options.replyTo) console.log(`[Email] Reply-To: ${options.replyTo}`);
    if (options.attachments) console.log(`[Email] Attachments: ${options.attachments.map(a => a.filename).join(", ")}`);
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
    replyTo: options.replyTo,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content.toString("base64"),
    })),
  });

  if (error) {
    console.error("[Email] Failed to send email:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Sends a renewal reminder email to a member whose season is not current.
 *
 * @param member - Member with membership data
 */
export async function sendRenewalReminder(member: MemberWithMembership): Promise<void> {
  const membership = member.membership;
  if (!membership) return;

  const subject = "Votre cotisation LADTC est à renouveler";
  const name = member.name ?? member.email;
  const html = renewalReminderTemplate(name, getCurrentSeason(), membership.amount);

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

  // For CLUB_PICKUP orders shippingEmail is null; the buyer's own email is the
  // canonical recipient (it was the source of shippingEmail for HOME_DELIVERY too).
  const recipient = order.shippingEmail ?? order.user.email;
  await sendEmail(recipient, subject, html);
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

  // For CLUB_PICKUP orders shippingEmail is null; the buyer's own email is the
  // canonical recipient (it was the source of shippingEmail for HOME_DELIVERY too).
  const recipient = order.shippingEmail ?? order.user.email;
  await sendEmail(recipient, subject, html);
}

/**
 * Sends an email notifying the member that their grouped equipment order has
 * been received at the club and is now ready for payment + pickup/delivery.
 * Includes a link to the order page where they can trigger Stripe Checkout.
 *
 * Accepts a relaxed order shape so it can be called from PATCH handlers that
 * only select id/name/email on the user relation (the template only reads
 * email and the buyer's name).
 *
 * @param order - The order with items + at least { user: { email } }
 */
export async function sendOrderReadyForPayment(
  order: Omit<Order, "user"> & { user: { email: string; name?: string | null } }
): Promise<void> {
  const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] ?? "https://ladtc.be";
  const payUrl = `${baseUrl}/equipment/order/${order.id}`;
  const subject = `Votre commande LADTC est arrivée — #${order.id.slice(-8).toUpperCase()}`;
  const html = orderReadyForPaymentTemplate(order as Order, payUrl);
  const recipient = order.shippingEmail ?? order.user.email;
  await sendEmail(recipient, subject, html);
}

/**
 * Sends a payment confirmation email for an equipment order.
 *
 * @param order - The complete order object with items
 */
export async function sendPaymentConfirmation(order: Order): Promise<void> {
  const subject = `Paiement reçu — Commande LADTC #${order.id.slice(-8).toUpperCase()}`;
  const html = paymentConfirmationTemplate(order);
  // For CLUB_PICKUP orders shippingEmail is null; the buyer's own email is the
  // canonical recipient (it was the source of shippingEmail for HOME_DELIVERY too).
  const recipient = order.shippingEmail ?? order.user.email;
  await sendEmail(recipient, subject, html);
}

/**
 * Sends a membership payment confirmation email, optionally with the
 * attestation PDF attached.
 *
 * @param email - Member's email address
 * @param name - Member's display name
 * @param amount - Amount paid in EUR
 * @param season - Season paid for (e.g. "2025-2026")
 * @param attestationPdf - Optional attestation PDF buffer to attach
 */
export async function sendMembershipPaymentConfirmation(
  email: string,
  name: string,
  amount: number,
  season: string,
  attestationPdf?: Buffer,
): Promise<void> {
  const subject = "Cotisation LADTC confirmée";
  const html = membershipPaymentConfirmationTemplate(name, amount, season);
  await sendEmail(email, subject, html, attestationPdf
    ? { attachments: [{ filename: `attestation-${season}.pdf`, content: attestationPdf }] }
    : {}
  );
}

/**
 * Forwards a public contact form submission to the committee mailbox.
 * Sets `replyTo` so a direct reply lands in the submitter's inbox.
 */
export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter?: boolean;
}): Promise<void> {
  const html = contactFormTemplate(data);
  const subject = `[Contact LADTC] ${data.subject}`;
  await sendEmail(COMMITTEE_EMAIL, subject, html, { replyTo: data.email });
}

// Export committee contact for convenience
export { COMMITTEE_EMAIL };
