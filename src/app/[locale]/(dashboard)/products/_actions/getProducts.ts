"use server";

import { prisma } from "@/lib/prisma";

interface GetProductsParams {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
  isFeatured?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function getProducts(params: GetProductsParams = {}) {
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder || "desc";

  const skip = (page - 1) * limit;

  let where: any = {};

  // Handle search
  if (params.search) {
    where.OR = [
      { name_en: { contains: params.search, mode: "insensitive" } },
      { name_ar: { contains: params.search, mode: "insensitive" } },
      { slug: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Handle filters
  if (params.isActive !== undefined) {
    where.isActive = params.isActive === "true";
  }

  if (params.isFeatured !== undefined) {
    where.isFeatured = params.isFeatured === "true";
  }

  if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            take: 1,
            select: {
              id: true,
              price: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}