import { prisma } from "@/lib/prisma";
import { Customer } from "@/generated/prisma";
import {
  createDateFilter,
  createNumericFilter,
  createTextFilter,
} from "@/lib/filters";

interface CustomersResponse {
  data: CustomerWithUser[];
  pageCount: number;
  total: number;
}

interface CustomerWithUser extends Customer {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    emailVerified: boolean;
  };
}

interface GetCustomersParams {
  page: number;
  perPage: number;
  sort?: string;
  filters?: string;
  name?: string;
  email?: string;
  gender?: string;
  totalOrdersMin?: string;
  totalOrdersMax?: string;
  totalSpentMin?: string;
  totalSpentMax?: string;
}

export async function getCustomers({
  page,
  perPage,
  sort,
  filters,
  name,
  email,
  gender,
  totalOrdersMin,
  totalOrdersMax,
  totalSpentMin,
  totalSpentMax,
}: GetCustomersParams): Promise<CustomersResponse> {
  try {
    const skip = (page - 1) * perPage;

    // Parse sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort) {
      try {
        const sortParams = JSON.parse(decodeURIComponent(sort));
        if (Array.isArray(sortParams) && sortParams.length > 0) {
          const firstSort = sortParams[0];
          
          // Handle nested user sorting
          if (firstSort.id === "name" || firstSort.id === "email") {
            orderBy = { 
              user: { 
                [firstSort.id]: firstSort.desc ? "desc" : "asc" 
              } 
            };
          } else {
            orderBy = { [firstSort.id]: firstSort.desc ? "desc" : "asc" };
          }
        }
      } catch (e) {
        // Keep default sort if parsing fails
      }
    }

    // Build where clause for filtering
    const where: any = {};

    // Handle new filters parameter
    if (filters) {
      try {
        const filterParams = JSON.parse(decodeURIComponent(filters));
        if (Array.isArray(filterParams)) {
          filterParams.forEach((filter: any) => {
            const { id, value, operator } = filter;

            switch (id) {
              case "name":
                where.user = {
                  ...where.user,
                  name: createTextFilter(operator, value),
                };
                break;

              case "email":
                where.user = {
                  ...where.user,
                  email: createTextFilter(operator, value),
                };
                break;

              case "gender":
                if (Array.isArray(value)) {
                  where.gender = {
                    in: value,
                  };
                } else {
                  where.gender =
                    operator === "is not" || operator === "notEquals"
                      ? { not: { equals: value } }
                      : { equals: value };
                }
                break;

              case "totalOrders":
                if (Array.isArray(value) && value.length === 2) {
                  const [min, max] = value;
                  where.totalOrders = { gte: Number(min), lte: Number(max) };
                } else {
                  where.totalOrders = createNumericFilter(operator, value);
                }
                break;

              case "totalSpent":
                if (Array.isArray(value) && value.length === 2) {
                  const [min, max] = value;
                  where.totalSpent = { gte: Number(min), lte: Number(max) };
                } else {
                  where.totalSpent = createNumericFilter(operator, value);
                }
                break;

              case "createdAt":
                if (Array.isArray(value) && value.length === 2) {
                  const [start, end] = value;
                  where.createdAt = {
                    gte: new Date(start),
                    lte: new Date(end),
                  };
                } else {
                  where.createdAt = createDateFilter(operator, value);
                }
                break;

              case "lastLogin":
                if (Array.isArray(value) && value.length === 2) {
                  const [start, end] = value;
                  where.lastLogin = {
                    gte: new Date(start),
                    lte: new Date(end),
                  };
                } else {
                  where.lastLogin = createDateFilter(operator, value);
                }
                break;
            }
          });
        }
      } catch (e) {
        console.error("Error parsing filters:", e);
      }
    }

    // Handle legacy parameters (fallback)
    if (name && !where.user?.name) {
      where.user = {
        ...where.user,
        name: { contains: name, mode: "insensitive" },
      };
    }

    if (email && !where.user?.email) {
      where.user = {
        ...where.user,
        email: { contains: email, mode: "insensitive" },
      };
    }

    if (gender && !where.gender) {
      where.gender = gender;
    }

    // Handle range filters
    if ((totalOrdersMin || totalOrdersMax) && !where.totalOrders) {
      where.totalOrders = {
        ...(totalOrdersMin && { gte: Number(totalOrdersMin) }),
        ...(totalOrdersMax && { lte: Number(totalOrdersMax) }),
      };
    }

    if ((totalSpentMin || totalSpentMax) && !where.totalSpent) {
      where.totalSpent = {
        ...(totalSpentMin && { gte: Number(totalSpentMin) }),
        ...(totalSpentMax && { lte: Number(totalSpentMax) }),
      };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
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
      }),
      prisma.customer.count({ where }),
    ]);

    const pageCount = Math.ceil(total / perPage);

    return {
      data: customers,
      pageCount,
      total,
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { data: [], pageCount: 0, total: 0 };
  }
}