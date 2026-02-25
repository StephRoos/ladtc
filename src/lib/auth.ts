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
    sendVerificationEmail: async ({ user, url }) => {
      const name = user.name || user.email;
      await sendEmail(
        user.email,
        "Vérifiez votre email — la dtc",
        emailVerificationTemplate(name, url),
      );
    },
  },
});
