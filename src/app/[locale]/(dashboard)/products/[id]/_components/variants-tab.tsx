"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VariantModal } from "./variant-modal";
import { DeleteVariantModal } from "./delete-variant-modal";
import type { Product } from "@/lib/schemas/product";
import type { ProductVariant } from "@/lib/schemas/product-variant";

interface VariantsTabProps {
  product: Product & {
    variants: ProductVariant[];
  };
}

export function VariantsTab({ product }: VariantsTabProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);

  const handleCreateVariant = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    setDeletingVariant(variant);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingVariant(null);
    setDeletingVariant(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Manage different variations of this product
              </CardDescription>
            </div>
            <Button onClick={handleCreateVariant} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {product.variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No variants created yet</p>
              <p className="text-sm">Add your first variant to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{variant.variant_name_en}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {variant.sku}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Arabic Name:</span>
                        <br />
                        {variant.variant_name_ar}
                      </div>
                      <div>
                        <span className="font-medium">Weight/Volume:</span>
                        <br />
                        {variant.weight_volume} {variant.unit}
                      </div>
                      <div>
                        <span className="font-medium">Price:</span>
                        <br />
                        ${variant.price}
                        {variant.compare_at_price && (
                          <span className="line-through ml-2">
                            ${variant.compare_at_price}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Barcode:</span>
                        <br />
                        {variant.barcode || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditVariant(variant)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVariant(variant)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <VariantModal
        open={isCreateModalOpen}
        onClose={handleModalClose}
        productId={product.id}
        baseSku={product.baseSku}
      />

      <VariantModal
        open={!!editingVariant}
        onClose={handleModalClose}
        productId={product.id}
        baseSku={product.baseSku}
        variant={editingVariant}
      />

      <DeleteVariantModal
        open={!!deletingVariant}
        onClose={handleModalClose}
        variant={deletingVariant}
      />
    </div>
  );
}