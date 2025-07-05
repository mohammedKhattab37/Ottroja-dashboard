import { Suspense } from "react";
import { UsersPageClient } from "./page.client";
import { getUsers } from "./_actions/getUsers";
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
  role?: string;
  emailVerified?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 10;

  const usersData = await getUsers({
    page,
    perPage,
    sort: params.sort,
    filters: params.filters,
    name: params.name,
    email: params.email,
    role: params.role,
    emailVerified: params.emailVerified,
  });

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <UsersPageClient
        initialData={usersData.data}
        pageCount={usersData.pageCount}
        total={usersData.total}
      />
    </Suspense>
  );
}