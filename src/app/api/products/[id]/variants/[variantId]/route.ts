import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductVariantSchema } from "@/lib/schemas/product-variant";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { id: productId, variantId } = params;

    const variant = await prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        productId,
      },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error fetching product variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch product variant" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { id: productId, variantId } = params;
    const body = await request.json();
    const validatedData = updateProductVariantSchema.parse(body);

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        productId,
      },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    // Check SKU uniqueness if being updated
    if (validatedData.sku && validatedData.sku !== existingVariant.sku) {
      const skuConflict = await prisma.productVariant.findFirst({
        where: {
          sku: validatedData.sku,
          id: { not: variantId },
        },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: "A variant with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: validatedData,
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error("Error updating product variant:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { id: productId, variantId } = params;

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findFirst({
      where: { 
        id: variantId,
        productId,
      },
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: "Product variant not found" },
        { status: 404 }
      );
    }

    // Check if this is the last variant
    const variantCount = await prisma.productVariant.count({
      where: { productId },
    });

    if (variantCount === 1) {
      // Deactivate the parent product if this is the last variant
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json({ message: "Product variant deleted successfully" });
  } catch (error) {
    console.error("Error deleting product variant:", error);
    return NextResponse.json(
      { error: "Failed to delete product variant" },
      { status: 500 }
    );
  }
}