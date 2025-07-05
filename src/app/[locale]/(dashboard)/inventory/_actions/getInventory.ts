import { prisma } from "@/lib/db";
import { inventoryFiltersSchema } from "@/lib/schemas/inventory";

interface GetInventoryParams {
  page?: number;
  perPage?: number;
  search?: string;
  location?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  sortBy?: "quantityOnHand" | "quantityAvailable" | "lastRestockDate" | "location";
  sortOrder?: "asc" | "desc";
}

export async function getInventory(params: GetInventoryParams = {}) {
  try {
    const validatedParams = inventoryFiltersSchema.parse(params);
    
    const {
      page = 1,
      perPage = 10,
      search,
      location,
      lowStock,
      outOfStock,
      sortBy,
      sortOrder = "desc",
    } = validatedParams;

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
          variant: {
            product: {
              name_en: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          variant: {
            product: {
              name_ar: {
                contains: search,
                mode: "insensitive",
              },
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

    return {
      data: inventory,
      total,
      page,
      perPage,
      pageCount,
    };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("Failed to fetch inventory data");
  }
}