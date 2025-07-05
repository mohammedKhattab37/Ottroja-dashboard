import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createInventorySchema, inventoryFiltersSchema } from "@/lib/schemas/inventory";
import { createInventoryForVariant } from "@/lib/inventory-utils";

// GET /api/inventory - Get all inventory records with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = inventoryFiltersSchema.parse({
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      perPage: searchParams.get("perPage") ? Number(searchParams.get("perPage")) : 10,
      search: searchParams.get("search") || undefined,
      location: searchParams.get("location") || undefined,
      lowStock: searchParams.get("lowStock") === "true" ? true : undefined,
      outOfStock: searchParams.get("outOfStock") === "true" ? true : undefined,
      sortBy: searchParams.get("sortBy") as any || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    });

    const { page, perPage, search, location, lowStock, outOfStock, sortBy, sortOrder } = filters;
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          variant: {
            variant_name_en: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          variant: {
            variant_name_ar: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          variant: {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (location) {
      where.location = location;
    }

    if (lowStock) {
      where.quantityOnHand = { lte: 10 }; // Default threshold
    }

    if (outOfStock) {
      where.quantityAvailable = { lte: 0 };
    }

    // Build orderBy clause
    let orderBy: any = { updatedAt: sortOrder };
    if (sortBy) {
      orderBy = { [sortBy]: sortOrder };
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: perPage,
        orderBy,
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
                },
              },
            },
          },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    const pageCount = Math.ceil(total / perPage);

    return NextResponse.json({
      data: inventory,
      total,
      page,
      perPage,
      pageCount,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createInventorySchema.parse(body);

    // Check if inventory already exists for this variant
    const existingInventory = await prisma.inventory.findUnique({
      where: { variantId: validatedData.variantId },
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: "Inventory already exists for this variant" },
        { status: 400 }
      );
    }

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: validatedData.variantId },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    const inventory = await createInventoryForVariant(validatedData.variantId);

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}