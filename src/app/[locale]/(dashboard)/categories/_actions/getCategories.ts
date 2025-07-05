import { prisma } from "@/lib/prisma";
import { Category } from "@/generated/prisma";
import {
  createDateFilter,
  createNumericFilter,
  createTextFilter,
} from "@/lib/filters";

interface CategoriesResponse {
  data: Category[];
  pageCount: number;
  total: number;
}

interface GetCategoriesParams {
  page: number;
  perPage: number;
  sort?: string;
  filters?: string;
  name?: string;
  isActive?: string;
  description?: string;
}

export async function getCategories({
  page,
  perPage,
  sort,
  filters,
  name,
  isActive,
  description,
}: GetCategoriesParams): Promise<CategoriesResponse> {
  try {
    const skip = (page - 1) * perPage;

    // Parse sorting
    let orderBy: any = { sortOrder: "asc" };
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
                const nameCondition = createTextFilter(operator, value);
                if (operator === "is empty" || operator === "is not empty") {
                  where.OR = [{ name: nameCondition }, { slug: nameCondition }];
                } else if (
                  operator.includes("not") ||
                  operator === "is not" ||
                  operator === "notILike" ||
                  operator === "does not contain"
                ) {
                  // For NOT operations, we want records where BOTH name AND slug don't match
                  where.AND = [
                    { name: nameCondition },
                    { slug: nameCondition },
                  ];
                } else {
                  // For positive operations, we want records where EITHER name OR slug matches
                  where.OR = [{ name: nameCondition }, { slug: nameCondition }];
                }
                break;

              case "description":
                where.description = createTextFilter(operator, value);
                break;

              case "isActive":
                if (Array.isArray(value)) {
                  where.isActive = {
                    in: value.map((v: string) => v === "true"),
                  };
                } else {
                  where.isActive =
                    operator === "is not" || operator === "notEquals"
                      ? { not: { equals: value === "true" } }
                      : { equals: value === "true" };
                }
                break;

              case "sortOrder":
                if (Array.isArray(value) && value.length === 2) {
                  const [min, max] = value;
                  where.sortOrder = { gte: Number(min), lte: Number(max) };
                } else {
                  where.sortOrder = createNumericFilter(operator, value);
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
    if (name && !where.OR && !where.AND) {
      where.OR = [
        { name: { contains: name, mode: "insensitive" } },
        { slug: { contains: name, mode: "insensitive" } },
      ];
    }

    if (isActive && !where.isActive) {
      where.isActive = isActive === "true";
    }

    if (description && !where.description) {
      where.description = { contains: description, mode: "insensitive" };
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
      prisma.category.count({ where }),
    ]);

    const pageCount = Math.ceil(total / perPage);

    return {
      data: categories,
      pageCount,
      total,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { data: [], pageCount: 0, total: 0 };
  }
}
