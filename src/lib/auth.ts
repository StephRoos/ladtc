import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail, sendWelcomeEmail } from "./email";
import {
  passwordResetTemplate,
  emailVerificationTemplate,
} from "./email-templates";

/**
 * BetterAuth configuration for LADTC
 * Simplified to match HillsRun's working pattern
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "MEMBER",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const name = user.name || user.email;
      await sendEmail(
        user.email,
        "Réinitialisation de mot de passe — la dtc",
        passwordResetTemplate(name, url),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const name = user.name || user.email;
      await sendEmail(
        user.email,
        "Vérifiez votre email — la dtc",
        emailVerificationTemplate(name, url),
      );
    },
    afterEmailVerification: async (user) => {
      try {
        await sendWelcomeEmail({ name: user.name, email: user.email });
        // Create an ACTIVE membership for the 2025-2026 season: the 100 existing
        // club members being invited are already paid up for this season. The
        // 2025-2026 fee was 50 EUR (no online processing fee back then — Stripe
        // was not yet in use). joinedAt is set to September 1, 2025 (start of
        // the 2025-2026 season) rather than the digital sign-up date: those
        // members joined the club at the start of the season even if they only
        // register on the website months later. The hook assumes the sign-up
        // comes from an invitation email sent to existing members. When the
        // 2026-2027 season opens (September), this hook must be updated: either
        // to PENDING for new members, or to drive the status from a query param
        // / role check rather than hardcoding it.
        await prisma.membership.create({
          data: {
            userId: user.id,
            status: "ACTIVE",
            season: "2025-2026",
            joinedAt: new Date("2025-09-01"),
            paidAt: new Date(),
            amount: 50,
          },
        });
      } catch (err) {
        console.error("[Auth] Failed to finalize sign-up:", err);
      }
    },
  },
});
