import { User } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Gets the current authenticated user for server components
 * Will redirect to login page if user is not authenticated
 * @param redirectTo Optional path to redirect to after login
 * @returns The authenticated user
 */
export async function getCurrentUser(redirectTo?: string): Promise<User> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      const loginPath = redirectTo
        ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
        : "/auth/login";

      redirect(loginPath);
    }

    return session.user as User;
  } catch (error) {
    const loginPath = redirectTo
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/auth/login";

    redirect(loginPath);
  }
}
