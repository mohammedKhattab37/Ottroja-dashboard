"use client";

import { useCallback, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Package } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { InventoryTable } from "./_components/inventory-table";
import { InventoryModal } from "./_components/inventory-modal";
import { StockAdjustmentModal } from "./_components/stock-adjustment-modal";

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

export function InventoryPageClient({
  initialData,
  pageCount,
  total,
}: {
  initialData: InventoryWithVariant[];
  pageCount: number;
  total: number;
}) {
  const t = useTranslations('Inventory');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Listen for URL parameter changes and trigger server refresh
  useEffect(() => {
    const currentParams = searchParams.toString();

    // Only refresh if we have search params and they've changed
    if (currentParams) {
      router.refresh();
    }
  }, [searchParams, router]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Calculate summary statistics
  const summary = {
    totalItems: initialData.length,
    lowStockItems: initialData.filter(item => item.quantityOnHand <= 10).length,
    outOfStockItems: initialData.filter(item => item.quantityAvailable <= 0).length,
    totalValue: initialData.reduce((sum, item) => sum + (item.quantityOnHand * item.variant.price), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StockAdjustmentModal
            onSuccess={handleRefresh}
            trigger={
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('adjustStock')}
              </Button>
            }
          />
          <InventoryModal
            onSuccess={handleRefresh}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('addInventory')}
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-3">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Items</p>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{summary.totalItems}</div>
        </div>
        
        <div className="rounded-lg border p-3">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">{t('status.lowStock')}</p>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-500">{summary.lowStockItems}</div>
        </div>
        
        <div className="rounded-lg border p-3">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">{t('status.outOfStock')}</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-500">{summary.outOfStockItems}</div>
        </div>
        
        <div className="rounded-lg border p-3">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium">Total Value</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">
            ${summary.totalValue.toFixed(2)}
          </div>
        </div>
      </div>

      <InventoryTable
        data={initialData}
        onRefresh={handleRefresh}
        pageCount={pageCount}
      />
    </div>
  );
}