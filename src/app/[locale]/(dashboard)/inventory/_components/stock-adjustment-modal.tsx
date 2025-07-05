"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryWithVariant {
  inventoryId: number;
  variantId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  variant: {
    id: string;
    sku: string;
    variant_name_en: string;
    variant_name_ar: string;
    product: {
      name_en: string;
      name_ar: string;
    };
  };
}

interface StockAdjustmentModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  inventory?: InventoryWithVariant;
}

export function StockAdjustmentModal({
  onSuccess,
  trigger,
  inventory,
}: StockAdjustmentModalProps) {
  const t = useTranslations('Inventory');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      variantId: inventory?.variantId || "",
      adjustmentType: "increase" as const,
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const selectedAdjustmentType = form.watch("adjustmentType");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate quantity
      if (data.quantity <= 0) {
        toast.error(t('errors.invalidQuantity'));
        return;
      }

      // Validate business rules
      if (inventory) {
        switch (data.adjustmentType) {
          case "decrease":
          case "fulfill":
            if (data.quantity > inventory.quantityOnHand) {
              toast.error(t('errors.insufficientStock'));
              return;
            }
            break;
          case "reserve":
            if (data.quantity > inventory.quantityAvailable) {
              toast.error(t('errors.insufficientStock'));
              return;
            }
            break;
          case "release":
            if (data.quantity > inventory.quantityReserved) {
              toast.error(t('errors.insufficientStock'));
              return;
            }
            break;
        }
      }

      const response = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to adjust stock");
      }

      toast.success(t('stockAdjusted'));
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('errors.adjustmentFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAdjustmentHelperText = () => {
    if (!inventory) return "";
    
    switch (selectedAdjustmentType) {
      case "increase":
        return `Current stock: ${inventory.quantityOnHand}`;
      case "decrease":
        return `Available to decrease: ${inventory.quantityOnHand}`;
      case "reserve":
        return `Available to reserve: ${inventory.quantityAvailable}`;
      case "release":
        return `Available to release: ${inventory.quantityReserved}`;
      case "fulfill":
        return `Available to fulfill: ${inventory.quantityReserved}`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('adjustStock')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('adjustStock')}</DialogTitle>
          <DialogDescription>
            Make stock adjustments for inventory items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {inventory && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <h4 className="font-medium">
                {inventory.variant.product.name_en}
              </h4>
              <p className="text-sm text-muted-foreground">
                {inventory.variant.variant_name_en} - {inventory.variant.sku}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="font-medium">{t('fields.quantityOnHand')}: </span>
                  {inventory.quantityOnHand}
                </div>
                <div>
                  <span className="font-medium">{t('fields.quantityReserved')}: </span>
                  {inventory.quantityReserved}
                </div>
                <div>
                  <span className="font-medium">{t('fields.quantityAvailable')}: </span>
                  {inventory.quantityAvailable}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="adjustmentType">{t('fields.adjustmentType')}</Label>
            <Select
              value={form.watch("adjustmentType")}
              onValueChange={(value) => form.setValue("adjustmentType", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="increase">
                  {t('adjustmentTypes.increase')}
                </SelectItem>
                <SelectItem value="decrease">
                  {t('adjustmentTypes.decrease')}
                </SelectItem>
                <SelectItem value="reserve">
                  {t('adjustmentTypes.reserve')}
                </SelectItem>
                <SelectItem value="release">
                  {t('adjustmentTypes.release')}
                </SelectItem>
                <SelectItem value="fulfill">
                  {t('adjustmentTypes.fulfill')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t('fields.quantity')}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...form.register("quantity", { 
                valueAsNumber: true,
                min: { value: 1, message: tValidation('invalidNumber') }
              })}
              placeholder={t('placeholders.quantity')}
            />
            {getAdjustmentHelperText() && (
              <p className="text-xs text-muted-foreground">
                {getAdjustmentHelperText()}
              </p>
            )}
            {form.formState.errors.quantity && (
              <p className="text-sm text-red-600">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t('fields.reason')}</Label>
            <Input
              id="reason"
              {...form.register("reason", {
                required: tValidation('required')
              })}
              placeholder={t('placeholders.reason')}
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-red-600">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('fields.notes')}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t('placeholders.notes')}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? tCommon('updating') : t('adjustStock')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}