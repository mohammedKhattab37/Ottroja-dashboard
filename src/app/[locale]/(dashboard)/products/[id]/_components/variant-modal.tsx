"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProductVariantSchema, type CreateProductVariant, type ProductVariant } from "@/lib/schemas/product-variant";

interface VariantModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  baseSku: string;
  variant?: ProductVariant | null;
}

export function VariantModal({ 
  open, 
  onClose, 
  productId, 
  baseSku, 
  variant 
}: VariantModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!variant;

  const form = useForm<CreateProductVariant>({
    resolver: zodResolver(createProductVariantSchema),
    defaultValues: {
      sku: "",
      variant_name_en: "",
      variant_name_ar: "",
      weight_volume: 0,
      unit: "",
      price: 0,
      compare_at_price: undefined,
      barcode: "",
    },
  });

  useEffect(() => {
    if (variant) {
      form.reset({
        sku: variant.sku,
        variant_name_en: variant.variant_name_en,
        variant_name_ar: variant.variant_name_ar,
        weight_volume: variant.weight_volume,
        unit: variant.unit,
        price: variant.price,
        compare_at_price: variant.compare_at_price || undefined,
        barcode: variant.barcode || "",
      });
    } else {
      form.reset({
        sku: "",
        variant_name_en: "",
        variant_name_ar: "",
        weight_volume: 0,
        unit: "",
        price: 0,
        compare_at_price: undefined,
        barcode: "",
      });
    }
  }, [variant, form]);

  const onSubmit = async (data: CreateProductVariant) => {
    setIsLoading(true);
    
    try {
      if (isEditing) {
        const response = await fetch(`/api/products/${productId}/variants/${variant.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update variant");
        }

        toast.success("Variant updated successfully");
      } else {
        const response = await fetch(`/api/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create variant");
        }

        toast.success("Variant created successfully");
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Variant" : "Create New Variant"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="variant_name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 500g, 1L" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variant_name_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arabic Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: 500 جرام، 1 لتر" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={`${baseSku}-1`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight/Volume *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01" 
                        placeholder="500"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="grams, ml, liters" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compare_at_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare At Price</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1234567890123" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}