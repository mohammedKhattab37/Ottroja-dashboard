import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/app/[locale]/(dashboard)/customers/_actions/getCustomers";
import { createCustomerSchema } from "@/lib/schemas/customer";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const sort = searchParams.get("sort") || undefined;
    const name = searchParams.get("name") || undefined;
    const email = searchParams.get("email") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const totalOrdersMin = searchParams.get("totalOrdersMin") || undefined;
    const totalOrdersMax = searchParams.get("totalOrdersMax") || undefined;
    const totalSpentMin = searchParams.get("totalSpentMin") || undefined;
    const totalSpentMax = searchParams.get("totalSpentMax") || undefined;

    const result = await getCustomers({
      page,
      perPage,
      sort,
      name,
      email,
      gender,
      totalOrdersMin,
      totalOrdersMax,
      totalSpentMin,
      totalSpentMax,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/customers:", error);
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
    const validatedData = createCustomerSchema.parse(body);

    // Check if user exists and has CUSTOMER role
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "User must have CUSTOMER role" },
        { status: 400 }
      );
    }

    // Check if customer already exists for this user
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId: validatedData.userId },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer profile already exists for this user" },
        { status: 400 }
      );
    }

    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        lastLogin: validatedData.lastLogin ? new Date(validatedData.lastLogin) : new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(customer, { status: 201 });
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

    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}