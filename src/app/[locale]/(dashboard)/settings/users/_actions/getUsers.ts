import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma";
import {
  createDateFilter,
  createTextFilter,
} from "@/lib/filters";

interface UsersResponse {
  data: User[];
  pageCount: number;
  total: number;
}

interface GetUsersParams {
  page: number;
  perPage: number;
  sort?: string;
  filters?: string;
  name?: string;
  email?: string;
  role?: string;
  emailVerified?: string;
}

export async function getUsers({
  page,
  perPage,
  sort,
  filters,
  name,
  email,
  role,
  emailVerified,
}: GetUsersParams): Promise<UsersResponse> {
  try {
    const skip = (page - 1) * perPage;

    // Parse sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort) {
      try {
        const sortParams = JSON.parse(decodeURIComponent(sort));
        if (Array.isArray(sortParams) && sortParams.length > 0) {
          const firstSort = sortParams[0];
          orderBy = { [firstSort.id]: firstSort.desc ? "desc" : "asc" };
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
                where.name = createTextFilter(operator, value);
                break;

              case "email":
                where.email = createTextFilter(operator, value);
                break;

              case "role":
                if (Array.isArray(value)) {
                  where.role = {
                    in: value,
                  };
                } else {
                  where.role =
                    operator === "is not" || operator === "notEquals"
                      ? { not: { equals: value } }
                      : { equals: value };
                }
                break;

              case "emailVerified":
                if (Array.isArray(value)) {
                  where.emailVerified = {
                    in: value.map((v: string) => v === "true"),
                  };
                } else {
                  where.emailVerified =
                    operator === "is not" || operator === "notEquals"
                      ? { not: { equals: value === "true" } }
                      : { equals: value === "true" };
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
            }
          });
        }
      } catch (e) {
        console.error("Error parsing filters:", e);
      }
    }

    // Handle legacy parameters (fallback)
    if (name && !where.name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (email && !where.email) {
      where.email = { contains: email, mode: "insensitive" };
    }

    if (role && !where.role) {
      where.role = role;
    }

    if (emailVerified && !where.emailVerified) {
      where.emailVerified = emailVerified === "true";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ]);

    const pageCount = Math.ceil(total / perPage);

    return {
      data: users,
      pageCount,
      total,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { data: [], pageCount: 0, total: 0 };
  }
}