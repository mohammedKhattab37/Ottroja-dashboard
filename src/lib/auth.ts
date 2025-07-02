import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { VALID_DOMAIN } from "./utils";
import { createAuthMiddleware } from "better-auth/api";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Check both sign-in and sign-up paths
      if (ctx.path === "/sign-in/email" || ctx.path === "/sign-up/email") {
        const { email } = ctx.body;

        if (!email || typeof email !== "string") {
          return new Response(
            JSON.stringify({
              error: "Invalid email format",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }

        const domain = email.split("@")[1];

        if (!domain || !VALID_DOMAIN().includes(domain)) {
          return new Response(
            JSON.stringify({
              error: `Invalid email domain. Allowed domains: ${VALID_DOMAIN().join(
                ", "
              )}`,
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
