import { Suspense } from "react";
import { CategoriesPageClient } from "./page.client";
import { getCategories } from "./_actions/getCategories";
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
  isActive?: string;
  description?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = Number(params.perPage) || 10;

  const categoriesData = await getCategories({
    page,
    perPage,
    sort: params.sort,
    filters: params.filters,
    name: params.name,
    isActive: params.isActive,
    description: params.description,
  });

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CategoriesPageClient
        initialData={categoriesData.data}
        pageCount={categoriesData.pageCount}
        total={categoriesData.total}
      />
    </Suspense>
  );
}
