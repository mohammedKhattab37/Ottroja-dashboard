import { VALID_DOMAIN } from "./utils";
import { createAuthMiddleware } from "better-auth/api";

export const validateEmail = createAuthMiddleware(async (ctx) => {
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
          error: `Invalid email domain.`,
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
});
