import type { MemberWithMembership } from "@/types";

const COMMITTEE_EMAIL = "bureau@ladtc.be";

/**
 * Send a renewal reminder email to a member.
 * Stubbed — logs to console until SMTP is configured.
 *
 * @param member - Member with membership data
 */
export function sendRenewalReminder(member: MemberWithMembership): void {
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

  const body =
    daysUntil > 0
      ? `Bonjour ${member.name ?? member.email},\n\nVotre cotisation LADTC expire le ${renewalDate}.\nMontant annuel : ${membership.amount} EUR\n\nPour renouveler, veuillez contacter ${COMMITTEE_EMAIL} ou visiter votre espace membre.\n\nCordialement,\nL'équipe LADTC`
      : `Bonjour ${member.name ?? member.email},\n\nVotre cotisation LADTC est à renouveler aujourd'hui.\nMontant annuel : ${membership.amount} EUR\n\nVeuillez contacter ${COMMITTEE_EMAIL} pour renouveler.\n\nCordialement,\nL'équipe LADTC`;

  console.log(`[Email] To: ${member.email}`);
  console.log(`[Email] Subject: ${subject}`);
  console.log(`[Email] Body:\n${body}`);
}

/**
 * Send a welcome email to a newly registered member.
 * Stubbed — logs to console until SMTP is configured.
 *
 * @param user - Newly registered user
 */
export function sendWelcomeEmail(user: { name: string | null; email: string }): void {
  const subject = "Bienvenue chez LADTC !";
  const body = `Bonjour ${user.name ?? user.email},\n\nBienvenue dans Les Amis Du Trail des Collines !\n\nVotre compte a été créé. Votre statut est en attente de validation par le bureau.\n\nPour toute question, contactez-nous à ${COMMITTEE_EMAIL}.\n\nCordialement,\nL'équipe LADTC`;

  console.log(`[Email] To: ${user.email}`);
  console.log(`[Email] Subject: ${subject}`);
  console.log(`[Email] Body:\n${body}`);
}
