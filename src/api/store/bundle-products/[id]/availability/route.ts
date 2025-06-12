import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getVariantAvailability } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const { id } = req.params;
    const query = req.scope.resolve("query");
    const { sales_channel_id } = req.query;

    // Get bundle with component products and their variants
    const { data: bundleData } = await query.graph({
        entity: "bundle",
        fields: [
            "id",
            "title",
            "items.*",
            "items.product.variants.*",
            "items.product.variants.inventory_items.*",
        ],
        filters: {
            id,
        },
    });

    if (!bundleData?.length) {
        return res.status(404).json({
            message: "Bundle not found",
        });
    }

    const bundle = bundleData[0];

    // Calculate availability for each component product
    const componentAvailabilities = await Promise.all(
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
                sales_channel_id: sales_channel_id as string,
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

    res.json({
        bundle_id: id,
        bundle_available: bundleAvailable,
        max_bundle_quantity: maxBundles,
        component_availability: componentAvailabilities,
    });
}
