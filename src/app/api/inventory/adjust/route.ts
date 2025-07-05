import { NextRequest, NextResponse } from "next/server";
import { stockAdjustmentSchema, bulkStockAdjustmentSchema } from "@/lib/schemas/inventory";
import { adjustStock, bulkAdjustStock } from "@/lib/inventory-utils";

// POST /api/inventory/adjust - Adjust stock for a single variant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a bulk adjustment or single adjustment
    if (body.adjustments && Array.isArray(body.adjustments)) {
      // Bulk adjustment
      const validatedData = bulkStockAdjustmentSchema.parse(body);
      const result = await bulkAdjustStock(validatedData.adjustments);
      
      return NextResponse.json({
        message: "Bulk stock adjustment completed",
        results: result.results,
        errors: result.errors,
        successCount: result.results.length,
        errorCount: result.errors.length,
      });
    } else {
      // Single adjustment
      const validatedData = stockAdjustmentSchema.parse(body);
      
      const updatedInventory = await adjustStock(validatedData);
      
      // Serialize dates to avoid JSON errors
      const serializedInventory = {
        ...updatedInventory,
        createdAt: updatedInventory.createdAt.toISOString(),
        updatedAt: updatedInventory.updatedAt.toISOString(),
        lastRestockDate: updatedInventory.lastRestockDate?.toISOString() || null,
      };
      
      return NextResponse.json({
        message: "Stock adjustment completed successfully",
        inventory: serializedInventory,
      });
    }
  } catch (error) {
    console.error("Error adjusting stock:", error);
    
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && (
      error.message.includes("Cannot") || 
      error.message.includes("not found") ||
      error.message.includes("Invalid adjustment")
    )) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to adjust stock" },
      { status: 500 }
    );
  }
}