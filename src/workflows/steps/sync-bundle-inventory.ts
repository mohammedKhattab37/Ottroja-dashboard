import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import { MedusaError } from "@medusajs/framework/utils";

export type SyncBundleInventoryStepInput = {
    bundle_id: string;
};

export const syncBundleInventoryStep = createStep(
    "sync-bundle-inventory",
    async ({ bundle_id }: SyncBundleInventoryStepInput, { container }) => {
        const query = container.resolve("query");
        const link = container.resolve("link");

        // Get bundle with its product and items
        const { data: bundleData } = await query.graph({
            entity: "bundle",
            filters: { id: bundle_id },
            fields: [
                "id",
                "product.id",
                "product.variants.*",
                "product.variants.inventory_items.*",
                "items.*",
                "items.product.variants.*",
                "items.product.variants.inventory_items.*",
            ],
        });

        if (!bundleData?.length) {
            throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                `Bundle with ID ${bundle_id} not found`
            );
        }

        const bundle = bundleData[0];

        if (!bundle.product?.variants?.[0]) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Bundle product has no variants`
            );
        }

        const bundleVariant = bundle.product.variants[0];

        // Collect inventory items from component products
        const inventoryItems: {
            inventory_item_id: string;
            required_quantity: number;
        }[] = [];

        bundle.items?.forEach((item: any) => {
            const componentVariant = item.product?.variants?.[0];
            const inventoryItem = componentVariant?.inventory_items?.[0];

            if (inventoryItem) {
                inventoryItems.push({
                    inventory_item_id: inventoryItem.inventory_item_id,
                    required_quantity: item.quantity,
                });
            }
        });

        // Update bundle variant inventory items
        if (inventoryItems.length > 0) {
            // Remove existing links
            try {
                await link.dismiss([
                    {
                        [Modules.PRODUCT]: {
                            variant_id: bundleVariant.id,
                        },
                        [Modules.INVENTORY]: {},
                    },
                ]);
            } catch (error) {
                // Ignore if no links exist
            }

            // Create new links
            await link.create(
                inventoryItems.map((item) => ({
                    [Modules.PRODUCT]: {
                        variant_id: bundleVariant.id,
                    },
                    [Modules.INVENTORY]: {
                        inventory_item_id: item.inventory_item_id,
                    },
                }))
            );
        }

        return new StepResponse({ bundle_id, inventory_items: inventoryItems });
    }
);
