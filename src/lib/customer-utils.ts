import { prisma } from "@/lib/prisma";

/**
 * Automatically create a customer profile when a user registers with CUSTOMER role
 */
export async function createCustomerProfileForUser(userId: string) {
  try {
    // Check if user exists and has CUSTOMER role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "CUSTOMER") {
      throw new Error("User not found or not a customer");
    }

    // Check if customer profile already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      return existingCustomer;
    }

    // Create customer profile with default values
    const customer = await prisma.customer.create({
      data: {
        userId,
        lastLogin: new Date(),
        totalOrders: 0,
        totalSpent: 0,
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

    return customer;
  } catch (error) {
    console.error("Error creating customer profile:", error);
    throw error;
  }
}

/**
 * Update customer metrics when orders change
 */
export async function updateCustomerMetrics(userId: string, totalOrders: number, totalSpent: number) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const updatedCustomer = await prisma.customer.update({
      where: { customerId: customer.customerId },
      data: {
        totalOrders,
        totalSpent,
        updatedAt: new Date(),
      },
    });

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer metrics:", error);
    throw error;
  }
}

/**
 * Update customer last login timestamp
 */
export async function updateCustomerLastLogin(userId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
    });

    if (!customer) {
      // If customer doesn't exist and user is a customer, create the profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role === "CUSTOMER") {
        return await createCustomerProfileForUser(userId);
      }
      
      return null;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { customerId: customer.customerId },
      data: {
        lastLogin: new Date(),
        updatedAt: new Date(),
      },
    });

    return updatedCustomer;
  } catch (error) {
    console.error("Error updating customer last login:", error);
    throw error;
  }
}

/**
 * Anonymize customer data for GDPR compliance
 */
export async function anonymizeCustomerData(customerId: number) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { customerId },
      include: { user: true },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    // Anonymize user data
    await prisma.user.update({
      where: { id: customer.userId },
      data: {
        name: `Anonymous User ${customerId}`,
        email: `anonymous-${customerId}@deleted.local`,
        image: null,
        emailVerified: false,
      },
    });

    // Clear sensitive customer data
    await prisma.customer.update({
      where: { customerId },
      data: {
        dateOfBirth: null,
        gender: null,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "Customer data anonymized successfully" };
  } catch (error) {
    console.error("Error anonymizing customer data:", error);
    throw error;
  }
}