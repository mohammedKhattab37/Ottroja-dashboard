"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { ProductVariant } from "@/lib/schemas/product-variant";

interface DeleteVariantModalProps {
  open: boolean;
  onClose: () => void;
  variant: ProductVariant | null;
}

export function DeleteVariantModal({ 
  open, 
  onClose, 
  variant 
}: DeleteVariantModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!variant) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${variant.productId}/variants/${variant.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete variant");
      }

      toast.success("Variant deleted successfully");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Variant
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this variant? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium">{variant.variant_name_en}</h3>
          <p className="text-sm text-muted-foreground">
            SKU: {variant.sku} • {variant.weight_volume} {variant.unit}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}