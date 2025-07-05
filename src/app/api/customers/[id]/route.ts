import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/schemas/customer";
import { z } from "zod";

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { customerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateCustomerSchema.parse({
      ...body,
      customerId,
    });

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.update({
      where: { customerId },
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
        lastLogin: validatedData.lastLogin ? new Date(validatedData.lastLogin) : undefined,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const customerId = parseInt(params.id);
    
    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Business rule: Cannot delete customers with order history
    // For now, we'll just check totalOrders > 0
    if (customer.totalOrders > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with order history. Consider anonymizing instead." },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { customerId },
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}