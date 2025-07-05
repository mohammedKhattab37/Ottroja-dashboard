import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductVariantSchema } from "@/lib/schemas/product-variant";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: {
        createdAt: "asc",
      },
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: productId } = params;
    const body = await request.json();
    const validatedData = createProductVariantSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Generate SKU if not provided
    if (!validatedData.sku) {
      const variantCount = await prisma.productVariant.count({
        where: { productId },
      });
      validatedData.sku = `${product.baseSku}-${variantCount + 1}`;
    }

    // Check if SKU already exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: "A variant with this SKU already exists" },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.create({
      data: {
        ...validatedData,
        productId,
      },
    });

    // Update product's base price if this is the first variant
    const variantCount = await prisma.productVariant.count({
      where: { productId },
    });

    if (variantCount === 1) {
      await prisma.product.update({
        where: { id: productId },
        data: { basePrice: validatedData.price },
      });
    }

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("Error creating product variant:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product variant" },
      { status: 500 }
    );
  }
}