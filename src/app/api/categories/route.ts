import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/app/[locale]/(dashboard)/categories/_actions/getCategories";
import { createCategorySchema } from "@/lib/schemas/category";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const sort = searchParams.get("sort") || undefined;
    const name = searchParams.get("name") || undefined;
    const isActive = searchParams.get("isActive") || undefined;
    const description = searchParams.get("description") || undefined;

    const result = await getCategories({
      page,
      perPage,
      sort,
      name,
      isActive,
      description,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = createCategorySchema.parse(body);

    // Auto-generate slug if not provided
    if (!validatedData.slug && validatedData.name) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Create the category
    const category = await prisma.category.create({
      data: validatedData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: (error as any).issues,
        },
        { status: 400 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
