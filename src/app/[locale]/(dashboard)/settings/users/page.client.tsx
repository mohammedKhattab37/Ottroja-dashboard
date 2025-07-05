"use client";

import { useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { UsersTable } from "./_components/users-table";
import { UserModal } from "./_components/user-modal";
import { User } from "@/generated/prisma";

export function UsersPageClient({
  initialData,
  pageCount,
  total,
}: {
  initialData: User[];
  pageCount: number;
  total: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Listen for URL parameter changes and trigger server refresh
  useEffect(() => {
    const currentParams = searchParams.toString();

    // Only refresh if we have search params and they've changed
    if (currentParams) {
      router.refresh();
    }
  }, [searchParams, router]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your users and their roles
          </p>
        </div>
        <UserModal
          onSuccess={handleRefresh}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          }
        />
      </div>

      <UsersTable
        data={initialData}
        onRefresh={handleRefresh}
        pageCount={pageCount}
      />
    </div>
  );
}