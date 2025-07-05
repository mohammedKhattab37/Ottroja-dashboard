import { Suspense } from "react";
import { CustomersPageClient } from "./page.client";
import { getCustomers } from "./_actions/getCustomers";
import { LoadingSkeleton } from "@/components/loading-skeleton";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SearchParams {
  page?: string;
  perPage?: string;
  sort?: string;
  filters?: string;
  name?: string;
  email?: string;
  gender?: string;
  totalOrdersMin?: string;
  totalOrdersMax?: string;
  totalSpentMin?: string;
  totalSpentMax?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 10;

  const customersData = await getCustomers({
    page,
    perPage,
    sort: params.sort,
    filters: params.filters,
    name: params.name,
    email: params.email,
    gender: params.gender,
    totalOrdersMin: params.totalOrdersMin,
    totalOrdersMax: params.totalOrdersMax,
    totalSpentMin: params.totalSpentMin,
    totalSpentMax: params.totalSpentMax,
  });

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CustomersPageClient
        initialData={customersData.data}
        pageCount={customersData.pageCount}
        total={customersData.total}
      />
    </Suspense>
  );
}