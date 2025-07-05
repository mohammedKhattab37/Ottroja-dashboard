import { z } from "zod";

// Base inventory schema for creation
export const createInventorySchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantityOnHand: z.number().int().min(0, "Quantity on hand must be 0 or greater"),
  quantityReserved: z.number().int().min(0, "Quantity reserved must be 0 or greater"),
  location: z.string().min(1, "Location is required").default("main_warehouse"),
  notes: z.string().optional(),
});

// Schema for updating inventory
export const updateInventorySchema = z.object({
  quantityOnHand: z.number().int().min(0, "Quantity on hand must be 0 or greater").optional(),
  quantityReserved: z.number().int().min(0, "Quantity reserved must be 0 or greater").optional(),
  location: z.string().min(1, "Location is required").optional(),
  notes: z.string().optional(),
});

// Schema for stock adjustments
export const stockAdjustmentSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  adjustmentType: z.enum(["increase", "decrease", "reserve", "release", "fulfill"]),
  quantity: z.number().int().min(1, "Quantity must be greater than 0"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

// Schema for bulk stock adjustments
export const bulkStockAdjustmentSchema = z.object({
  adjustments: z.array(stockAdjustmentSchema).min(1, "At least one adjustment is required"),
});

// Schema for inventory filters
export const inventoryFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  location: z.string().optional(),
  lowStock: z.boolean().optional(),
  outOfStock: z.boolean().optional(),
  sortBy: z.enum(["quantityOnHand", "quantityAvailable", "lastRestockDate", "location"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for setting stock thresholds
export const stockThresholdSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  lowStockThreshold: z.number().int().min(0, "Low stock threshold must be 0 or greater"),
  criticalStockThreshold: z.number().int().min(0, "Critical stock threshold must be 0 or greater"),
});

// Schema for inventory reports
export const inventoryReportSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeMovements: z.boolean().default(true),
  includeAdjustments: z.boolean().default(true),
  location: z.string().optional(),
  variantIds: z.array(z.string()).optional(),
});

// Validation for quantity availability check
export const quantityAvailabilitySchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  requestedQuantity: z.number().int().min(1, "Requested quantity must be greater than 0"),
});

// Custom validation function for reserved quantity
export const validateReservedQuantity = (onHand: number, reserved: number) => {
  if (reserved > onHand) {
    throw new Error("Reserved quantity cannot exceed quantity on hand");
  }
  return true;
};

// Custom validation for stock adjustment
export const validateStockAdjustment = (
  currentStock: number,
  adjustmentType: string,
  quantity: number
) => {
  switch (adjustmentType) {
    case "decrease":
    case "fulfill":
      if (quantity > currentStock) {
        throw new Error("Cannot decrease stock below zero");
      }
      break;
    case "reserve":
      // This would need current available quantity check
      break;
    case "release":
      // This would need current reserved quantity check
      break;
    default:
      break;
  }
  return true;
};

// Types
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type BulkStockAdjustmentInput = z.infer<typeof bulkStockAdjustmentSchema>;
export type InventoryFiltersInput = z.infer<typeof inventoryFiltersSchema>;
export type StockThresholdInput = z.infer<typeof stockThresholdSchema>;
export type InventoryReportInput = z.infer<typeof inventoryReportSchema>;
export type QuantityAvailabilityInput = z.infer<typeof quantityAvailabilitySchema>;