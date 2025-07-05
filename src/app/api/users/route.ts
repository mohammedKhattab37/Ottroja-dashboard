import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/app/[locale]/(dashboard)/settings/users/_actions/getUsers";
import { createUserSchema } from "@/lib/schemas/user";
import { prisma } from "@/lib/prisma";
import { createCustomerProfileForUser } from "@/lib/customer-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("perPage")) || 10;
    const sort = searchParams.get("sort") || undefined;
    const name = searchParams.get("name") || undefined;
    const email = searchParams.get("email") || undefined;
    const role = searchParams.get("role") || undefined;
    const emailVerified = searchParams.get("emailVerified") || undefined;

    const result = await getUsers({
      page,
      perPage,
      sort,
      name,
      email,
      role,
      emailVerified,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/users:", error);
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
    const validatedData = createUserSchema.parse(body);

    // Generate user ID
    const userId = crypto.randomUUID();

    // Create the user
    const user = await prisma.user.create({
      data: {
        id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...validatedData,
      },
    });

    // Automatically create customer profile if user role is CUSTOMER
    if (validatedData.role === "CUSTOMER") {
      try {
        await createCustomerProfileForUser(userId);
      } catch (customerError) {
        console.error("Failed to create customer profile:", customerError);
        // Don't fail the user creation if customer profile creation fails
      }
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user as any;

    return NextResponse.json(userWithoutPassword, { status: 201 });
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

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}