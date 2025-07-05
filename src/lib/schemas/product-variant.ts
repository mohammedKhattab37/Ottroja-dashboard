import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string().min(1, "SKU is required"),
  variant_name_en: z.string().min(1, "English variant name is required"),
  variant_name_ar: z.string().min(1, "Arabic variant name is required"),
  weight_volume: z.number().min(0, "Weight/volume must be positive"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be positive"),
  compare_at_price: z.number().min(0, "Compare at price must be positive").optional(),
  barcode: z.string().optional(),
  createdAt: z.date(),
});

export const createProductVariantSchema = productVariantSchema.omit({
  id: true,
  productId: true,
  createdAt: true,
}).extend({
  sku: z.string().optional(),
});

export const updateProductVariantSchema = productVariantSchema.omit({
  productId: true,
  createdAt: true,
}).partial().extend({
  id: z.string(),
});

export type ProductVariant = z.infer<typeof productVariantSchema>;
export type CreateProductVariant = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>;