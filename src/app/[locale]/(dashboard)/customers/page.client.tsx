"use client";

import { useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { CustomersTable } from "./_components/customers-table";
import { CustomerModal } from "./_components/customer-modal";

interface CustomerWithUser {
  customerId: number;
  userId: string;
  dateOfBirth: Date | null;
  gender: string | null;
  lastLogin: Date | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
  };
}

export function CustomersPageClient({
  initialData,
  pageCount,
  total,
}: {
  initialData: CustomerWithUser[];
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer profiles and view their analytics
          </p>
        </div>
        <CustomerModal
          onSuccess={handleRefresh}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          }
        />
      </div>

      <CustomersTable
        data={initialData}
        onRefresh={handleRefresh}
        pageCount={pageCount}
      />
    </div>
  );
}