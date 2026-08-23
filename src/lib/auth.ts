import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail, sendWelcomeEmail } from "./email";
import {
  passwordResetTemplate,
  emailVerificationTemplate,
} from "./email-templates";
import { MEMBERSHIP_DUES_NET } from "./membership-fees";

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
      dateOfBirth: {
        type: "date",
        required: false,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
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
        // Create a PENDING membership for new self-service registrations.
        // The member must pay the cotisation online (or in cash to the
        // treasurer) before gaining access to member-only features.
        // joinedAt defaults to now() — no backdating since this is a genuine
        // new registration, not an invitation of an existing club member.
        await prisma.membership.create({
          data: {
            userId: user.id,
            status: "PENDING",
            season: null,
            joinedAt: new Date(),
            paidAt: null,
            amount: MEMBERSHIP_DUES_NET,
          },
        });
      } catch (err) {
        console.error("[Auth] Failed to finalize sign-up:", err);
      }
    },
  },
  // Brute-force protection on auth endpoints. In-memory storage is fine for
  // the single-container Coolify deployment.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 300, max: 5 },
      "/forget-password": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
      "/send-verification-email": { window: 300, max: 3 },
    },
  },
});
