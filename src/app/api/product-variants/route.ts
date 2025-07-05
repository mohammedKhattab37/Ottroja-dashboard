import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/product-variants - Get all product variants for dropdowns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withoutInventory = searchParams.get("withoutInventory") === "true";

    // Build where clause to exclude variants that already have inventory
    const where: any = {};
    
    if (withoutInventory) {
      where.inventory = null;
    }

    const variants = await prisma.productVariant.findMany({
      where,
      select: {
        id: true,
        sku: true,
        variant_name_en: true,
        variant_name_ar: true,
        weight_volume: true,
        unit: true,
        price: true,
        product: {
          select: {
            id: true,
            name_en: true,
            name_ar: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { product: { name_en: "asc" } },
        { variant_name_en: "asc" },
      ],
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching product variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch product variants" },
      { status: 500 }
    );
  }
}