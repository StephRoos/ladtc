import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
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
    requireEmailVerification: false,
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
    sendVerificationEmail: async ({ user, url }) => {
      const name = user.name || user.email;
      await sendEmail(
        user.email,
        "Vérifiez votre email — la dtc",
        emailVerificationTemplate(name, url),
      );
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Auto-create a pending membership for self-registered members so they
        // can pay their dues right after signing up (committee decision
        // 2026-06-12, Option B). Admin-created members are created via Prisma
        // directly with their own membership and bypass this adapter hook.
        after: async (user) => {
          const existing = await prisma.membership.findUnique({
            where: { userId: user.id },
          });
          if (!existing) {
            // amount defaults to the current season dues (55 €) via the schema.
            await prisma.membership.create({ data: { userId: user.id } });
          }
        },
      },
    },
  },
});
