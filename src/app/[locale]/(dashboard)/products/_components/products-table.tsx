"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import type { Product } from "@/lib/schemas/product";
import type { Category } from "@/lib/schemas/category";

interface ProductsTableProps {
  data: {
    products: (Product & {
      category: {
        id: string;
        name: string;
        slug: string;
      };
      variants: {
        id: string;
        price: number;
      }[];
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ 
  data, 
  categories, 
  onEdit, 
  onDelete 
}: ProductsTableProps) {
  const router = useRouter();

  const columns = useMemo<ColumnDef<ProductsTableProps["data"]["products"][0]>[]>(
    () => [
      {
        accessorKey: "name_en",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium">{product.name_en}</span>
              <span className="text-sm text-muted-foreground">{product.name_ar}</span>
              <span className="text-xs text-muted-foreground">{product.slug}</span>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "category.name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => {
          const category = row.original.category;
          return (
            <Badge variant="outline">
              {category.name}
            </Badge>
          );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "baseSku",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="SKU" />
        ),
        cell: ({ row }) => {
          return (
            <span className="font-mono text-sm">
              {row.getValue("baseSku")}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "basePrice",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Base Price" />
        ),
        cell: ({ row }) => {
          const price = row.getValue("basePrice") as number;
          return (
            <span className="font-medium">
              ${price.toFixed(2)}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "variants",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Variants" />
        ),
        cell: ({ row }) => {
          const variants = row.getValue("variants") as any[];
          return (
            <Badge variant="secondary">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "isFeatured",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Featured" />
        ),
        cell: ({ row }) => {
          const isFeatured = row.getValue("isFeatured") as boolean;
          return isFeatured ? (
            <Badge variant="default">Featured</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
        enableSorting: true,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/products/${product.id}/edit`)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View/Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router, onEdit, onDelete]
  );

  const { table } = useDataTable({
    data: data.products,
    columns,
    pageCount: data.totalPages,
    enableAdvancedFilter: true,
  });

  return (
    <DataTable table={table} />
  );
}