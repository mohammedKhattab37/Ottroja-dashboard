"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { ProductsTable } from "./_components/products-table";
import { ProductModal } from "./_components/product-modal";
import { DeleteProductModal } from "./_components/delete-product-modal";
import type { Product } from "@/lib/schemas/product";
import type { Category } from "@/lib/schemas/category";

interface ProductsPageClientProps {
  initialData: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: Category[];
}

export function ProductsPageClient({ 
  initialData, 
  categories 
}: ProductsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingProduct(null);
    setDeletingProduct(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <ProductsTable
        data={initialData}
        categories={categories}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <ProductModal
        open={isCreateModalOpen}
        onClose={handleModalClose}
        categories={categories}
      />

      <ProductModal
        open={!!editingProduct}
        onClose={handleModalClose}
        product={editingProduct}
        categories={categories}
      />

      <DeleteProductModal
        open={!!deletingProduct}
        onClose={handleModalClose}
        product={deletingProduct}
      />
    </div>
  );
}