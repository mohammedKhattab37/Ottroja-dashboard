"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export function BreadcrumbNav() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Remove locale prefix from pathname
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");

    // Split the path into segments
    const segments = pathWithoutLocale.split("/").filter(Boolean);

    // Generate breadcrumb items
    const items: BreadcrumbItem[] = [];

    // Add home breadcrumb
    items.push({
      label: "Dashboard",
      href: `/${pathname.split("/")[1]}`,
    });

    // Add breadcrumb for each path segment
    let currentPath = `/${pathname.split("/")[1]}`;

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastItem = index === segments.length - 1;

      items.push({
        label:
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: isLastItem ? undefined : currentPath,
        isCurrentPage: isLastItem,
      });
    });

    return items;
  }, [pathname]);

  // If we only have the home breadcrumb, don't show breadcrumbs
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/50" />
          )}
          {item.isCurrentPage ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <a
              href={item.href || "#"}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
