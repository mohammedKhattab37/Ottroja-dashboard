"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";

import { Category } from "@/generated/prisma";
import { CategoryModal, DeleteCategoryModal } from "./category-modal";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";

export function CategoriesTable({
  data,
  onRefresh,
  pageCount,
}: {
  data: Category[];
  onRefresh?: () => void;
  pageCount: number;
}) {
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{category.name}</span>
              <span className="text-muted-foreground text-sm">
                /{category.slug}
              </span>
            </div>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const category = row.original;
          const searchValue = value.toLowerCase();
          return (
            category.name.toLowerCase().includes(searchValue) ||
            category.slug.toLowerCase().includes(searchValue)
          );
        },
        meta: {
          label: "Name",
          variant: "text",
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => {
          const description = row.getValue("description") as string | null;
          return (
            <div className="max-w-[200px] truncate">
              {description || <span className="text-muted-foreground">—</span>}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const description = row.getValue("description") as string | null;
          if (!description) return false;
          return description.toLowerCase().includes(value.toLowerCase());
        },
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
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const isActive = row.getValue("isActive") as boolean;
          return value.includes(String(isActive));
        },
        meta: {
          label: "Status",
          variant: "select",
          options: [
            { label: "Active", value: "true" },
            { label: "Inactive", value: "false" },
          ],
        },
      },
      {
        accessorKey: "sortOrder",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Sort Order" />
        ),
        cell: ({ row }) => {
          const sortOrder = row.getValue("sortOrder") as number;
          return <span className="text-center">{sortOrder}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const sortOrder = row.getValue("sortOrder") as number;
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value;
            return sortOrder >= min && sortOrder <= max;
          }
          return true;
        },
        meta: {
          label: "Sort Order",
          variant: "range",
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt") as string);
          return <span>{format(date, "MMM dd, yyyy")}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const date = new Date(row.getValue("createdAt") as string);
          if (Array.isArray(value) && value.length === 2) {
            const [start, end] = value.map((v) => new Date(v));
            return date >= start && date <= end;
          }
          return true;
        },
        meta: {
          label: "Created At",
          variant: "date",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const category = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(category.id)}
                >
                  Copy category ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <CategoryModal
                  mode="edit"
                  category={category}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  }
                />
                <DeleteCategoryModal
                  category={category}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onRefresh]
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
  });

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar table={table}>
        <DataTableFilterMenu table={table} />
        <DataTableSortList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}
