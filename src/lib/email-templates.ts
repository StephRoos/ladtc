import type { Order } from "@/types";

const CLUB_NAME = "la dtc";
const CLUB_EMAIL = "noreply@ladtc.be";
const CLUB_WEBSITE = "https://ladtc.be";
const PRIMARY_COLOR = "#FF8C00";
const BACKGROUND_COLOR = "#0f172a";
const TEXT_COLOR = "#f1f5f9";
const SECONDARY_BG = "#1e293b";

/**
 * Returns a base HTML wrapper with LADTC branding.
 *
 * @param content - Inner HTML content to wrap
 * @returns Full HTML email string
 */
function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>la dtc</title>
</head>
<body style="margin:0;padding:0;background-color:${BACKGROUND_COLOR};font-family:Arial,Helvetica,sans-serif;color:${TEXT_COLOR};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BACKGROUND_COLOR};padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:${SECONDARY_BG};border-radius:8px 8px 0 0;padding:24px 32px;border-bottom:3px solid ${PRIMARY_COLOR};">
              <h1 style="margin:0;color:${PRIMARY_COLOR};font-size:24px;font-weight:bold;letter-spacing:1px;">la dtc</h1>
              <p style="margin:4px 0 0 0;color:#94a3b8;font-size:13px;">Trail running — Ellezelles</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:${SECONDARY_BG};padding:32px;border-radius:0 0 8px 8px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:12px;">
                ${CLUB_NAME}<br/>
                <a href="mailto:${CLUB_EMAIL}" style="color:#64748b;">${CLUB_EMAIL}</a> &middot;
                <a href="${CLUB_WEBSITE}" style="color:#64748b;">${CLUB_WEBSITE}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Returns a styled button HTML element.
 *
 * @param href - URL the button links to
 * @param label - Button label text
 * @returns HTML string for the button
 */
function buttonHtml(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:${PRIMARY_COLOR};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:bold;font-size:14px;margin-top:20px;">${label}</a>`;
}

/**
 * Generates the welcome email HTML template.
 *
 * @param name - Member's display name
 * @returns Full HTML email string
 */
export function welcomeEmailTemplate(name: string): string {
  const content = `
    <h2 style="margin:0 0 16px 0;color:${TEXT_COLOR};font-size:20px;">Bienvenue chez la dtc, ${name} !</h2>
    <p style="margin:0 0 16px 0;color:#cbd5e1;line-height:1.6;">
      Nous sommes ravis de vous accueillir dans <strong style="color:${TEXT_COLOR};">la dtc</strong>.
      Votre compte a été créé avec succès.
    </p>
    <div style="background-color:${BACKGROUND_COLOR};border-radius:6px;padding:20px;margin:24px 0;">
      <p style="margin:0 0 8px 0;color:#94a3b8;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Prochaines étapes</p>
      <ul style="margin:0;padding-left:20px;color:#cbd5e1;line-height:1.8;">
        <li>Votre adhésion est en attente de validation par le bureau</li>
        <li>Vous recevrez une confirmation une fois votre dossier traité</li>
        <li>Consultez notre site pour les événements à venir</li>
      </ul>
    </div>
    <p style="margin:0 0 8px 0;color:#cbd5e1;line-height:1.6;">
      Pour toute question, n'hésitez pas à nous contacter à
      <a href="mailto:${CLUB_EMAIL}" style="color:${PRIMARY_COLOR};">${CLUB_EMAIL}</a>.
    </p>
    ${buttonHtml(CLUB_WEBSITE, "Visiter le site")}
    <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px;">
      Cordialement,<br/>
      <strong style="color:${TEXT_COLOR};">L'équipe la dtc</strong>
    </p>
  `;
  return baseTemplate(content);
}

/**
 * Generates the renewal reminder email HTML template.
 *
 * @param name - Member's display name
 * @param date - Renewal date formatted as a string (e.g. "01/03/2025")
 * @param amount - Membership fee amount in EUR
 * @returns Full HTML email string
 */
export function renewalReminderTemplate(name: string, date: string, amount: number): string {
  const content = `
    <h2 style="margin:0 0 16px 0;color:${TEXT_COLOR};font-size:20px;">Rappel de renouvellement, ${name}</h2>
    <p style="margin:0 0 16px 0;color:#cbd5e1;line-height:1.6;">
      Votre cotisation annuelle la dtc arrive à échéance. Voici un rappel des informations importantes.
    </p>
    <div style="background-color:${BACKGROUND_COLOR};border-radius:6px;padding:20px;margin:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Date d'échéance</td>
          <td style="color:${PRIMARY_COLOR};font-weight:bold;text-align:right;padding:6px 0;">${date}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #334155;padding:0;height:1px;"></td>
        </tr>
        <tr>
          <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Montant annuel</td>
          <td style="color:${TEXT_COLOR};font-weight:bold;text-align:right;padding:6px 0;">${amount.toFixed(2)} EUR</td>
        </tr>
      </table>
    </div>
    <p style="margin:0 0 16px 0;color:#cbd5e1;line-height:1.6;">
      Pour renouveler votre adhésion, veuillez contacter le bureau à
      <a href="mailto:${CLUB_EMAIL}" style="color:${PRIMARY_COLOR};">${CLUB_EMAIL}</a>
      ou accéder à votre espace membre.
    </p>
    ${buttonHtml(`${CLUB_WEBSITE}/membre`, "Mon espace membre")}
    <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px;">
      Cordialement,<br/>
      <strong style="color:${TEXT_COLOR};">L'équipe la dtc</strong>
    </p>
  `;
  return baseTemplate(content);
}

/**
 * Generates the order confirmation email HTML template.
 *
 * @param order - The full order object with items and user info
 * @returns Full HTML email string
 */
export function orderConfirmationTemplate(order: Order): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="color:#cbd5e1;padding:8px 0;border-bottom:1px solid #334155;">
          ${item.product.name}${item.size ? ` <span style="color:#94a3b8;font-size:12px;">(${item.size})</span>` : ""}
        </td>
        <td style="color:#94a3b8;text-align:center;padding:8px 0;border-bottom:1px solid #334155;">x${item.quantity}</td>
        <td style="color:${TEXT_COLOR};text-align:right;padding:8px 0;border-bottom:1px solid #334155;font-weight:bold;">
          ${(item.price * item.quantity).toFixed(2)} EUR
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <h2 style="margin:0 0 16px 0;color:${TEXT_COLOR};font-size:20px;">Confirmation de commande</h2>
    <p style="margin:0 0 16px 0;color:#cbd5e1;line-height:1.6;">
      Merci pour votre commande, ${order.shippingName} ! Voici le récapitulatif :
    </p>
    <div style="background-color:${BACKGROUND_COLOR};border-radius:6px;padding:20px;margin:24px 0;">
      <p style="margin:0 0 12px 0;color:#94a3b8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
        Commande #${order.id.slice(-8).toUpperCase()}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}
        <tr>
          <td colspan="3" style="padding:8px 0;"></td>
        </tr>
        <tr>
          <td colspan="2" style="color:#94a3b8;padding:6px 0;">Sous-total</td>
          <td style="color:${TEXT_COLOR};text-align:right;padding:6px 0;">${order.subtotal.toFixed(2)} EUR</td>
        </tr>
        <tr>
          <td colspan="2" style="color:#94a3b8;padding:6px 0;">Frais de port</td>
          <td style="color:${TEXT_COLOR};text-align:right;padding:6px 0;">${order.shippingCost > 0 ? order.shippingCost.toFixed(2) + " EUR" : "Gratuit"}</td>
        </tr>
        <tr>
          <td colspan="3" style="border-top:1px solid #334155;padding:0;height:1px;"></td>
        </tr>
        <tr>
          <td colspan="2" style="color:${TEXT_COLOR};font-weight:bold;padding:8px 0;font-size:16px;">Total</td>
          <td style="color:${PRIMARY_COLOR};text-align:right;font-weight:bold;padding:8px 0;font-size:16px;">${order.total.toFixed(2)} EUR</td>
        </tr>
      </table>
    </div>
    <div style="background-color:${BACKGROUND_COLOR};border-radius:6px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px 0;color:#94a3b8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Livraison</p>
      <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">
        ${order.shippingName}<br/>
        ${order.shippingAddress}<br/>
        ${order.shippingZip} ${order.shippingCity}<br/>
        ${order.shippingCountry}
      </p>
    </div>
    <p style="margin:0 0 8px 0;color:#cbd5e1;line-height:1.6;">
      Pour toute question concernant votre commande, contactez-nous à
      <a href="mailto:${CLUB_EMAIL}" style="color:${PRIMARY_COLOR};">${CLUB_EMAIL}</a>.
    </p>
    <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px;">
      Cordialement,<br/>
      <strong style="color:${TEXT_COLOR};">L'équipe la dtc</strong>
    </p>
  `;
  return baseTemplate(content);
}

/**
 * Generates the order status update email HTML template.
 *
 * @param order - The full order object
 * @param status - New order status (e.g. "SHIPPED", "DELIVERED")
 * @returns Full HTML email string
 */
export function orderStatusTemplate(order: Order, status: string): string {
  const statusLabels: Record<string, { label: string; description: string; color: string }> = {
    CONFIRMED: {
      label: "Commande confirmée",
      description: "Votre commande a été confirmée et est en cours de préparation.",
      color: "#22c55e",
    },
    SHIPPED: {
      label: "Commande expédiée",
      description: "Votre commande est en route ! Vous la recevrez prochainement.",
      color: PRIMARY_COLOR,
    },
    DELIVERED: {
      label: "Commande livrée",
      description: "Votre commande a été livrée. Nous espérons que vous en êtes satisfait(e) !",
      color: "#22c55e",
    },
    CANCELLED: {
      label: "Commande annulée",
      description: "Votre commande a été annulée. Contactez-nous pour plus d'informations.",
      color: "#ef4444",
    },
  };

  const statusInfo = statusLabels[status] ?? {
    label: `Statut : ${status}`,
    description: "Le statut de votre commande a été mis à jour.",
    color: PRIMARY_COLOR,
  };

  const trackingSection =
    order.trackingNumber
      ? `<div style="background-color:${BACKGROUND_COLOR};border-radius:6px;padding:16px 20px;margin-top:20px;">
          <p style="margin:0 0 4px 0;color:#94a3b8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Numéro de suivi</p>
          <p style="margin:0;color:${PRIMARY_COLOR};font-weight:bold;font-size:15px;">${order.trackingNumber}</p>
        </div>`
      : "";

  const content = `
    <h2 style="margin:0 0 16px 0;color:${TEXT_COLOR};font-size:20px;">Mise à jour de votre commande</h2>
    <div style="border-left:4px solid ${statusInfo.color};padding:12px 16px;margin-bottom:24px;background-color:${BACKGROUND_COLOR};border-radius:0 6px 6px 0;">
      <p style="margin:0 0 4px 0;color:${statusInfo.color};font-weight:bold;">${statusInfo.label}</p>
      <p style="margin:0;color:#cbd5e1;font-size:14px;">${statusInfo.description}</p>
    </div>
    <p style="margin:0 0 8px 0;color:#94a3b8;font-size:13px;">
      Commande référence : <strong style="color:${TEXT_COLOR};">#${order.id.slice(-8).toUpperCase()}</strong>
    </p>
    ${trackingSection}
    <p style="margin:20px 0 8px 0;color:#cbd5e1;line-height:1.6;">
      Pour toute question, contactez-nous à
      <a href="mailto:${CLUB_EMAIL}" style="color:${PRIMARY_COLOR};">${CLUB_EMAIL}</a>.
    </p>
    <p style="margin:24px 0 0 0;color:#94a3b8;font-size:13px;">
      Cordialement,<br/>
      <strong style="color:${TEXT_COLOR};">L'équipe la dtc</strong>
    </p>
  `;
  return baseTemplate(content);
}
