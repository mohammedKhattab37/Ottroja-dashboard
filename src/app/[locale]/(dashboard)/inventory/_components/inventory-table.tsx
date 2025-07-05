"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2, TrendingUp, Copy } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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

import { InventoryModal, DeleteInventoryModal } from "./inventory-modal";
import { StockAdjustmentModal } from "./stock-adjustment-modal";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";

interface InventoryWithVariant {
  inventoryId: number;
  variantId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lastRestockDate: Date | null;
  location: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  variant: {
    id: string;
    sku: string;
    variant_name_en: string;
    variant_name_ar: string;
    weight_volume: number;
    unit: string;
    price: number;
    product: {
      id: string;
      name_en: string;
      name_ar: string;
      slug: string;
      imageUrl: string | null;
    };
  };
}

export function InventoryTable({
  data,
  onRefresh,
  pageCount,
}: {
  data: InventoryWithVariant[];
  onRefresh?: () => void;
  pageCount: number;
}) {
  const t = useTranslations('Inventory');
  const tCommon = useTranslations('Common');
  const tTable = useTranslations('Inventory.table');
  const locale = useLocale();

  const getStockStatus = (onHand: number, available: number) => {
    if (available <= 0) return { status: 'outOfStock', color: 'destructive' as const };
    if (onHand <= 10) return { status: 'lowStock', color: 'secondary' as const };
    return { status: 'inStock', color: 'default' as const };
  };

  const columns = useMemo<ColumnDef<InventoryWithVariant>[]>(
    () => [
      {
        accessorKey: "variant",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.variant')} />
        ),
        cell: ({ row }) => {
          const inventory = row.original;
          const productName = locale === 'ar' 
            ? inventory.variant.product.name_ar 
            : inventory.variant.product.name_en;
          const variantName = locale === 'ar'
            ? inventory.variant.variant_name_ar
            : inventory.variant.variant_name_en;

          return (
            <div className="flex flex-col">
              <span className="font-medium">{productName}</span>
              <span className="text-sm text-muted-foreground">{variantName}</span>
              <span className="text-xs text-muted-foreground">
                {inventory.variant.weight_volume} {inventory.variant.unit}
              </span>
            </div>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const inventory = row.original;
          const searchValue = value.toLowerCase();
          return (
            inventory.variant.product.name_en.toLowerCase().includes(searchValue) ||
            inventory.variant.product.name_ar.toLowerCase().includes(searchValue) ||
            inventory.variant.variant_name_en.toLowerCase().includes(searchValue) ||
            inventory.variant.variant_name_ar.toLowerCase().includes(searchValue)
          );
        },
        meta: {
          label: tTable('columns.variant'),
          variant: "text",
        },
      },
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.sku')} />
        ),
        cell: ({ row }) => {
          return (
            <span className="font-mono text-sm">
              {row.original.variant.sku}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          return row.original.variant.sku.toLowerCase().includes(value.toLowerCase());
        },
        meta: {
          label: tTable('columns.sku'),
          variant: "text",
        },
      },
      {
        accessorKey: "quantityOnHand",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.quantityOnHand')} />
        ),
        cell: ({ row }) => {
          return (
            <span className="text-center font-medium">
              {row.original.quantityOnHand.toLocaleString()}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const quantity = row.original.quantityOnHand;
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value;
            return quantity >= min && quantity <= max;
          }
          return true;
        },
        meta: {
          label: tTable('columns.quantityOnHand'),
          variant: "range",
        },
      },
      {
        accessorKey: "quantityReserved",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.quantityReserved')} />
        ),
        cell: ({ row }) => {
          return (
            <span className="text-center font-medium text-orange-600">
              {row.original.quantityReserved.toLocaleString()}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "quantityAvailable",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.quantityAvailable')} />
        ),
        cell: ({ row }) => {
          const available = row.original.quantityAvailable;
          const { status, color } = getStockStatus(row.original.quantityOnHand, available);
          
          return (
            <Badge variant={color}>
              {available.toLocaleString()} - {t(`status.${status}`)}
            </Badge>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.location')} />
        ),
        cell: ({ row }) => {
          return (
            <span className="text-sm">
              {row.original.location}
            </span>
          );
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          return row.original.location.toLowerCase().includes(value.toLowerCase());
        },
        meta: {
          label: tTable('columns.location'),
          variant: "text",
        },
      },
      {
        accessorKey: "lastRestockDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={tTable('columns.lastRestockDate')} />
        ),
        cell: ({ row }) => {
          const date = row.original.lastRestockDate;
          if (!date) {
            return <span className="text-muted-foreground">—</span>;
          }
          return <span className="text-sm">{format(new Date(date), "MMM dd, yyyy")}</span>;
        },
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          const date = row.original.lastRestockDate;
          if (!date) return false;
          
          if (Array.isArray(value) && value.length === 2) {
            const [start, end] = value.map((v) => new Date(v));
            const itemDate = new Date(date);
            return itemDate >= start && itemDate <= end;
          }
          return true;
        },
        meta: {
          label: tTable('columns.lastRestockDate'),
          variant: "date",
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inventory = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tCommon('actions')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(String(inventory.inventoryId))}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {tTable('actions.copyId')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <StockAdjustmentModal
                  inventory={inventory}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {tTable('actions.adjust')}
                    </DropdownMenuItem>
                  }
                />
                <InventoryModal
                  mode="edit"
                  inventory={inventory}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      {tTable('actions.edit')}
                    </DropdownMenuItem>
                  }
                />
                <DeleteInventoryModal
                  inventory={inventory}
                  onSuccess={onRefresh}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {tTable('actions.delete')}
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onRefresh, t, tCommon, tTable, locale]
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