import { Suspense } from "react";
import { InventoryPageClient } from "./page.client";
import { getInventory } from "./_actions/getInventory";
import { LoadingSkeleton } from "@/components/loading-skeleton";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SearchParams {
  page?: string;
  perPage?: string;
  sort?: string;
  search?: string;
  location?: string;
  lowStock?: string;
  outOfStock?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 10;

  const inventoryData = await getInventory({
    page,
    perPage,
    search: params.search,
    location: params.location,
    lowStock: params.lowStock === "true",
    outOfStock: params.outOfStock === "true",
    sortBy: params.sortBy as any,
    sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
  });

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InventoryPageClient
        initialData={inventoryData.data}
        pageCount={inventoryData.pageCount}
        total={inventoryData.total}
      />
    </Suspense>
  );
}