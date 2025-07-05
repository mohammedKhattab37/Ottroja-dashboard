import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name_en: z.string().min(1, "English name is required"),
  name_ar: z.string().min(1, "Arabic name is required"),
  slug: z.string().min(1, "Slug is required"),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  short_description_en: z.string().optional(),
  short_description_ar: z.string().optional(),
  brief_title_en: z.string().optional(),
  brief_title_ar: z.string().optional(),
  brief_text_en: z.string().optional(),
  brief_text_ar: z.string().optional(),
  warnings_en: z.array(z.string()).optional(),
  warnings_ar: z.array(z.string()).optional(),
  benefits_en: z.array(z.string()).optional(),
  benefits_ar: z.array(z.string()).optional(),
  ingredients_en: z.array(z.string()).optional(),
  ingredients_ar: z.array(z.string()).optional(),
  baseSku: z.string().min(1, "Base SKU is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().optional(),
});

export const updateProductSchema = productSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial().extend({
  id: z.string(),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;