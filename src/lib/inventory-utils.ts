import { prisma } from "@/lib/db";
import type { StockAdjustmentInput } from "@/lib/schemas/inventory";

// Calculate available quantity
export function calculateAvailableQuantity(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}

// Create inventory record when variant is created
export async function createInventoryForVariant(variantId: string) {
  try {
    const inventory = await prisma.inventory.create({
      data: {
        variantId,
        quantityOnHand: 0,
        quantityReserved: 0,
        quantityAvailable: 0,
        location: "main_warehouse",
      },
    });
    return inventory;
  } catch (error) {
    throw new Error(`Failed to create inventory for variant: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Update inventory and recalculate available quantity
export async function updateInventoryQuantities(
  inventoryId: number,
  data: {
    quantityOnHand?: number;
    quantityReserved?: number;
    location?: string;
    notes?: string;
  }
) {
  try {
    // Get current inventory
    const currentInventory = await prisma.inventory.findUnique({
      where: { inventoryId },
    });

    if (!currentInventory) {
      throw new Error("Inventory record not found");
    }

    const newOnHand = data.quantityOnHand ?? currentInventory.quantityOnHand;
    const newReserved = data.quantityReserved ?? currentInventory.quantityReserved;

    // Validate reserved doesn't exceed on hand
    if (newReserved > newOnHand) {
      throw new Error("Reserved quantity cannot exceed quantity on hand");
    }

    const newAvailable = calculateAvailableQuantity(newOnHand, newReserved);

    // Update last restock date if quantity on hand increased
    const shouldUpdateRestockDate = data.quantityOnHand && data.quantityOnHand > currentInventory.quantityOnHand;

    const updatedInventory = await prisma.inventory.update({
      where: { inventoryId },
      data: {
        ...data,
        quantityAvailable: newAvailable,
        ...(shouldUpdateRestockDate && { lastRestockDate: new Date() }),
      },
    });

    return updatedInventory;
  } catch (error) {
    throw new Error(`Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Stock adjustment operations
export async function adjustStock(adjustment: StockAdjustmentInput) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { variantId: adjustment.variantId },
    });

    if (!inventory) {
      throw new Error("Inventory record not found");
    }

    let newOnHand = inventory.quantityOnHand;
    let newReserved = inventory.quantityReserved;

    switch (adjustment.adjustmentType) {
      case "increase":
        newOnHand += adjustment.quantity;
        break;
      
      case "decrease":
        if (adjustment.quantity > inventory.quantityOnHand) {
          throw new Error("Cannot decrease stock below zero");
        }
        newOnHand -= adjustment.quantity;
        break;
      
      case "reserve":
        const availableQuantity = calculateAvailableQuantity(inventory.quantityOnHand, inventory.quantityReserved);
        if (adjustment.quantity > availableQuantity) {
          throw new Error("Cannot reserve more than available quantity");
        }
        newReserved += adjustment.quantity;
        break;
      
      case "release":
        if (adjustment.quantity > inventory.quantityReserved) {
          throw new Error("Cannot release more than reserved quantity");
        }
        newReserved -= adjustment.quantity;
        break;
      
      case "fulfill":
        if (adjustment.quantity > inventory.quantityReserved) {
          throw new Error("Cannot fulfill more than reserved quantity");
        }
        newReserved -= adjustment.quantity;
        newOnHand -= adjustment.quantity;
        break;
      
      default:
        throw new Error("Invalid adjustment type");
    }

    // Ensure reserved doesn't exceed on hand after adjustment
    if (newReserved > newOnHand) {
      newReserved = newOnHand;
    }

    const newAvailable = calculateAvailableQuantity(newOnHand, newReserved);

    // Update inventory directly
    const updatedInventory = await prisma.inventory.update({
      where: { inventoryId: inventory.inventoryId },
      data: {
        quantityOnHand: newOnHand,
        quantityReserved: newReserved,
        quantityAvailable: newAvailable,
        notes: adjustment.notes,
        lastRestockDate: adjustment.adjustmentType === "increase" ? new Date() : inventory.lastRestockDate,
      },
    });

    // Log the adjustment (you could create an audit log table for this)
    await logInventoryMovement({
      variantId: adjustment.variantId,
      adjustmentType: adjustment.adjustmentType,
      quantity: adjustment.quantity,
      reason: adjustment.reason,
      notes: adjustment.notes,
      previousOnHand: inventory.quantityOnHand,
      previousReserved: inventory.quantityReserved,
      newOnHand,
      newReserved,
      newAvailable,
    });

    return updatedInventory;
  } catch (error) {
    throw new Error(`Stock adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Log inventory movements for audit trail
export async function logInventoryMovement(movement: {
  variantId: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
  notes?: string;
  previousOnHand: number;
  previousReserved: number;
  newOnHand: number;
  newReserved: number;
  newAvailable: number;
}) {
  // This would typically go to a separate audit/log table
  // For now, we'll just skip logging
}

// Check if stock is low based on threshold
export function checkLowStock(onHand: number, lowStockThreshold: number = 10): boolean {
  return onHand <= lowStockThreshold;
}

// Check if stock is out
export function checkOutOfStock(available: number): boolean {
  return available <= 0;
}

// Get inventory with low stock
export async function getLowStockInventory(threshold: number = 10) {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantityOnHand: {
          lte: threshold,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
    return lowStockItems;
  } catch (error) {
    throw new Error(`Failed to get low stock inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get inventory with out of stock
export async function getOutOfStockInventory() {
  try {
    const outOfStockItems = await prisma.inventory.findMany({
      where: {
        quantityAvailable: {
          lte: 0,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });
    return outOfStockItems;
  } catch (error) {
    throw new Error(`Failed to get out of stock inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Bulk stock adjustments
export async function bulkAdjustStock(adjustments: StockAdjustmentInput[]) {
  const results = [];
  const errors = [];

  for (const adjustment of adjustments) {
    try {
      const result = await adjustStock(adjustment);
      results.push({ variantId: adjustment.variantId, success: true, result });
    } catch (error) {
      errors.push({
        variantId: adjustment.variantId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { results, errors };
}

// Check quantity availability for order
export async function checkQuantityAvailability(variantId: string, requestedQuantity: number) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      return { available: false, message: "Inventory record not found" };
    }

    const isAvailable = inventory.quantityAvailable >= requestedQuantity;

    return {
      available: isAvailable,
      quantityAvailable: inventory.quantityAvailable,
      quantityRequested: requestedQuantity,
      message: isAvailable 
        ? "Quantity is available" 
        : `Only ${inventory.quantityAvailable} units available`,
    };
  } catch (error) {
    throw new Error(`Failed to check quantity availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}