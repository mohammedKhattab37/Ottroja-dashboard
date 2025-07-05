import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductEditPageClient } from "./page.client";
import { prisma } from "@/lib/prisma";
import { getCategories } from "../../../categories/_actions/getCategories";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return product;
}

export default async function ProductEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [product, categoriesData] = await Promise.all([
    getProduct(resolvedParams.id),
    getCategories({ page: 1, perPage: 1000 }),
  ]);

  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductEditPageClient 
        product={product} 
        categories={categoriesData.data}
      />
    </Suspense>
  );
}