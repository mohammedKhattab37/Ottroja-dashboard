import { getVariantAvailability } from "@medusajs/framework/utils";

export interface BundleInventoryCheck {
    bundle_id: string;
    bundle_available: boolean;
    max_bundle_quantity: number;
    component_availability: ComponentAvailability[];
}

export interface ComponentAvailability {
    item_id: string;
    product_id: string;
    variant_id?: string;
    quantity_required: number;
    available_quantity: number;
    can_fulfill: boolean;
}

/**
 * Check if a bundle can be fulfilled based on component product inventory
 */
export async function checkBundleInventoryAvailability(
    query: any,
    bundleData: any,
    salesChannelId: string
): Promise<BundleInventoryCheck> {
    const bundle = bundleData;

    // Calculate availability for each component product
    const componentAvailabilities: ComponentAvailability[] = await Promise.all(
        bundle.items.map(async (item: any) => {
            const variant = item.product?.variants?.[0];

            if (!variant) {
                return {
                    item_id: item.id,
                    product_id: item.product.id,
                    quantity_required: item.quantity,
                    available_quantity: 0,
                    can_fulfill: false,
                };
            }

            // Get variant availability
            const availability = await getVariantAvailability(query, {
                variant_ids: [variant.id],
                sales_channel_id: salesChannelId,
            });

            const availableQuantity =
                availability[variant.id]?.availability || 0;
            const canFulfill = availableQuantity >= item.quantity;

            return {
                item_id: item.id,
                product_id: item.product.id,
                variant_id: variant.id,
                quantity_required: item.quantity,
                available_quantity: availableQuantity,
                can_fulfill: canFulfill,
            };
        })
    );

    // Bundle is available only if ALL components can be fulfilled
    const bundleAvailable = componentAvailabilities.every(
        (comp) => comp.can_fulfill
    );

    // Calculate maximum number of bundles that can be created
    const maxBundles =
        componentAvailabilities.length > 0
            ? Math.min(
                  ...componentAvailabilities.map((comp) =>
                      Math.floor(
                          comp.available_quantity / comp.quantity_required
                      )
                  )
              )
            : 0;

    return {
        bundle_id: bundle.id,
        bundle_available: bundleAvailable,
        max_bundle_quantity: maxBundles,
        component_availability: componentAvailabilities,
    };
}

/**
 * Get the inventory items that should be linked to a bundle variant
 */
export function getBundleInventoryItems(
    componentProducts: any[],
    bundleItems: any[]
): { inventory_item_id: string; required_quantity: number }[] {
    const inventoryItems: {
        inventory_item_id: string;
        required_quantity: number;
    }[] = [];

    componentProducts.forEach((product) => {
        // Find the corresponding bundle item for this product
        const bundleItem = bundleItems.find(
            (item) => item.product_id === product.id
        );

        if (bundleItem && product.variants?.[0]?.inventory_items?.[0]) {
            inventoryItems.push({
                inventory_item_id:
                    product.variants[0].inventory_items[0].inventory_item_id,
                required_quantity: bundleItem.quantity,
            });
        }
    });

    return inventoryItems;
}
