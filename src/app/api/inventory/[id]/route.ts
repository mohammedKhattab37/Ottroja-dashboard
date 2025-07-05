import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateInventorySchema } from "@/lib/schemas/inventory";
import { updateInventoryQuantities } from "@/lib/inventory-utils";

// GET /api/inventory/[id] - Get specific inventory record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.findUnique({
      where: { inventoryId },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name_en: true,
                name_ar: true,
                slug: true,
                imageUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] - Update inventory record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateInventorySchema.parse(body);

    // Check if inventory exists
    const existingInventory = await prisma.inventory.findUnique({
      where: { inventoryId },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const updatedInventory = await updateInventoryQuantities(inventoryId, validatedData);

    // Ensure the response is serializable
    const response = {
      ...updatedInventory,
      createdAt: updatedInventory.createdAt.toISOString(),
      updatedAt: updatedInventory.updatedAt.toISOString(),
      lastRestockDate: updatedInventory.lastRestockDate?.toISOString() || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating inventory:", error);
    
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Reserved quantity")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    // Check if inventory exists
    const existingInventory = await prisma.inventory.findUnique({
      where: { inventoryId },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Check if there are reserved quantities
    if (existingInventory.quantityReserved > 0) {
      return NextResponse.json(
        { error: "Cannot delete inventory with reserved quantities" },
        { status: 400 }
      );
    }

    await prisma.inventory.delete({
      where: { inventoryId },
    });

    return NextResponse.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 }
    );
  }
}