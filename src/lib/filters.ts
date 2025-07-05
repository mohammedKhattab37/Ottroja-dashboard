// Helper function to create text-based filter conditions
export function createTextFilter(
  operator: string,
  value: string,
  mode: "insensitive" | "default" = "insensitive"
) {
  switch (operator) {
    case "iLike":
    case "contains":
      return { contains: value, mode };
    case "notILike":
    case "does not contain":
      return {
        not: {
          contains: value,
        },
      };
    case "is":
    case "equals":
      return { equals: value, mode };
    case "is not":
    case "notEquals":
      return {
        not: {
          equals: value,
        },
      };
    case "is empty":
      return {
        OR: [{ equals: "" }, { equals: null }],
      };
    case "is not empty":
      return {
        AND: [{ not: { equals: "" } }, { not: { equals: null } }],
      };
    default:
      return { contains: value, mode };
  }
}

// Helper function to create numeric filter conditions
export function createNumericFilter(operator: string, value: string | number) {
  const numValue = Number(value);

  switch (operator) {
    case "is":
    case "equals":
      return { equals: numValue };
    case "is not":
    case "notEquals":
      return { not: { equals: numValue } };
    case "gt":
    case "greaterThan":
      return { gt: numValue };
    case "gte":
    case "greaterThanOrEqual":
      return { gte: numValue };
    case "lt":
    case "lessThan":
      return { lt: numValue };
    case "lte":
    case "lessThanOrEqual":
      return { lte: numValue };
    default:
      return { equals: numValue };
  }
}

// Helper function to create date filter conditions
export function createDateFilter(operator: string, value: string) {
  const dateValue = new Date(value);

  switch (operator) {
    case "is":
    case "equals":
      const startOfDay = new Date(dateValue);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateValue);
      endOfDay.setHours(23, 59, 59, 999);
      return { gte: startOfDay, lte: endOfDay };
    case "gt":
    case "after":
      return { gt: dateValue };
    case "gte":
    case "onOrAfter":
      return { gte: dateValue };
    case "lt":
    case "before":
      return { lt: dateValue };
    case "lte":
    case "onOrBefore":
      return { lte: dateValue };
    default:
      return { gte: dateValue };
  }
}
