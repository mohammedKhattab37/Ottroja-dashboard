import { User } from "@/generated/prisma";
import { useSession } from "@/lib/auth-client";

export const useCurrentUser = () => {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user as User | undefined,
    isLoading: isPending,
  };
};
