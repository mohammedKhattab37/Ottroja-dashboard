"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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
  lastRestockDate: Date | null;
  location: string;
  notes: string | null;
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

interface InventoryModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  inventory?: InventoryWithVariant;
  mode?: "create" | "edit";
}

export function InventoryModal({
  onSuccess,
  trigger,
  inventory,
  mode = "create",
}: InventoryModalProps) {
  const t = useTranslations('Inventory');
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  const form = useForm({
    defaultValues: {
      variantId: inventory?.variantId || "",
      quantityOnHand: inventory?.quantityOnHand || 0,
      quantityReserved: inventory?.quantityReserved || 0,
      location: inventory?.location || "main_warehouse",
      notes: inventory?.notes || "",
    },
    mode: "onChange",
  });

  // Load product variants for dropdown
  useEffect(() => {
    if (mode === "create" && isOpen) {
      loadVariants();
    }
  }, [mode, isOpen]);

  const loadVariants = async () => {
    setLoadingVariants(true);
    try {
      const response = await fetch("/api/product-variants");
      if (response.ok) {
        const data = await response.json();
        setVariants(data);
      }
    } catch (error) {
      console.error("Failed to load variants:", error);
    } finally {
      setLoadingVariants(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Validate reserved doesn't exceed on hand
      if (data.quantityReserved > data.quantityOnHand) {
        toast.error(t('errors.reservedExceedsOnHand'));
        setIsLoading(false);
        return;
      }

      const url = mode === "edit" 
        ? `/api/inventory/${inventory?.inventoryId}` 
        : "/api/inventory";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${mode} inventory`);
      }

      toast.success(
        mode === "edit" ? t('inventoryUpdated') : t('inventoryCreated')
      );
      form.reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : tCommon('error')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('addInventory')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? t('editInventory') : t('createInventory')}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the inventory information."
              : "Create a new inventory record for a product variant."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="variantId">{t('fields.variantId')}</Label>
              <Select
                value={form.watch("variantId")}
                onValueChange={(value) => form.setValue("variantId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('placeholders.selectVariant')} />
                </SelectTrigger>
                <SelectContent>
                  {loadingVariants ? (
                    <SelectItem value="loading" disabled>
                      {tCommon('loading')}
                    </SelectItem>
                  ) : (
                    variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        <div className="flex flex-col">
                          <span>{variant.product.name_en}</span>
                          <span className="text-sm text-muted-foreground">
                            {variant.variant_name_en} - {variant.sku}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.variantId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.variantId.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityOnHand">{t('fields.quantityOnHand')}</Label>
              <Input
                id="quantityOnHand"
                type="number"
                min="0"
                {...form.register("quantityOnHand", { 
                  valueAsNumber: true,
                  min: { value: 0, message: tValidation('invalidNumber') }
                })}
                placeholder="0"
              />
              {form.formState.errors.quantityOnHand && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.quantityOnHand.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantityReserved">{t('fields.quantityReserved')}</Label>
              <Input
                id="quantityReserved"
                type="number"
                min="0"
                {...form.register("quantityReserved", { 
                  valueAsNumber: true,
                  min: { value: 0, message: tValidation('invalidNumber') }
                })}
                placeholder="0"
              />
              {form.formState.errors.quantityReserved && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.quantityReserved.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('fields.location')}</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder={t('placeholders.location')}
            />
            {form.formState.errors.location && (
              <p className="text-sm text-red-600">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('fields.notes')}</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder={t('placeholders.notes')}
              rows={3}
            />
            {form.formState.errors.notes && (
              <p className="text-sm text-red-600">
                {form.formState.errors.notes.message}
              </p>
            )}
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
              {isLoading
                ? (mode === "edit" ? tCommon('updating') : tCommon('creating'))
                : (mode === "edit" ? tCommon('edit') : tCommon('create'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteInventoryModalProps {
  inventory: InventoryWithVariant;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DeleteInventoryModal({
  inventory,
  onSuccess,
  trigger,
}: DeleteInventoryModalProps) {
  const t = useTranslations('Inventory');
  const tCommon = useTranslations('Common');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (inventory.quantityReserved > 0) {
      toast.error(t('deleteWithReserved', { count: inventory.quantityReserved }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${inventory.inventoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete inventory");
      }

      toast.success(t('inventoryDeleted'));
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('errors.deleteFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteInventory')}</DialogTitle>
          <DialogDescription>
            {t('confirmDelete')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? tCommon('deleting') : t('deleteInventory')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}