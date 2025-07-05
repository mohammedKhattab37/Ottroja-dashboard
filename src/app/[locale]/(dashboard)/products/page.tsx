import { Suspense } from "react";
import { ProductsPageClient } from "./page.client";
import { getProducts } from "./_actions/getProducts";
import { getCategories } from "../categories/_actions/getCategories";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    isActive?: string;
    isFeatured?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [productsData, categoriesData] = await Promise.all([
    getProducts(searchParams),
    getCategories({ page: 1, perPage: 1000 }),
  ]);

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsPageClient 
        initialData={productsData} 
        categories={categoriesData.data}
      />
    </Suspense>
  );
}