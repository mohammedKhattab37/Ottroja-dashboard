import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "./validate-email";
import { UserRole } from "@/generated/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  hooks: {
    before: validateEmail,
  },
  user: {
    additionalFields: {
      role: {
        type: [
          UserRole.ADMIN,
          UserRole.DESIGNER,
          UserRole.MARKETER,
          UserRole.CUSTOMER,
        ],
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
