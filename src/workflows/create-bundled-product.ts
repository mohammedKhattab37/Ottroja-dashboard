import { CreateProductWorkflowInputDTO } from "@medusajs/framework/types";
import {
    createWorkflow,
    transform,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createBundleStep } from "./steps/create-bundle";
import { createBundleItemsStep } from "./steps/create-bundle-items";
import {
    createProductsWorkflow,
    createRemoteLinkStep,
    useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import { BUNDLED_PRODUCT_MODULE } from "../modules/bundled-product";
import { Modules } from "@medusajs/framework/utils";

export type CreateBundledProductWorkflowInput = {
    bundle: {
        title: string;
        product: CreateProductWorkflowInputDTO;
        items: {
            product_id: string;
            quantity: number;
        }[];
    };
};

export const createBundledProductWorkflow = createWorkflow(
    "create-bundled-product",
    ({ bundle: bundleData }: CreateBundledProductWorkflowInput) => {
        const bundle = createBundleStep({
            title: bundleData.title,
        });

        const bundleItems = createBundleItemsStep({
            bundle_id: bundle.id,
            items: bundleData.items,
        });

        // Get inventory item IDs from the component products
        const componentProductIds = transform(
            {
                bundleData,
            },
            (data) => data.bundleData.items.map((item) => item.product_id)
        );

        // @ts-ignore
        const { data: productsWithInventory } = useQueryGraphStep({
            entity: "product",
            fields: ["id", "variants.*", "variants.inventory_items.*"],
            filters: {
                id: componentProductIds,
            },
        }).config({ name: "get-component-products-inventory" });

        const inventoryItemIds = transform(
            {
                productsWithInventory,
                bundleData,
            },
            (data) => {
                const inventoryItems: {
                    inventory_item_id: string;
                    required_quantity: number;
                }[] = [];

                data.productsWithInventory.forEach((product) => {
                    // Find the corresponding bundle item for this product
                    const bundleItem = data.bundleData.items.find(
                        (item) => item.product_id === product.id
                    );

                    if (
                        bundleItem &&
                        product.variants?.[0]?.inventory_items?.[0]
                    ) {
                        inventoryItems.push({
                            inventory_item_id:
                                product.variants[0].inventory_items[0]
                                    .inventory_item_id,
                            required_quantity: bundleItem.quantity,
                        });
                    }
                });

                return inventoryItems;
            }
        );

        // Create bundled product with inventory item links
        const bundleProduct = createProductsWorkflow.runAsStep({
            input: {
                products: [
                    {
                        ...bundleData.product,
                        variants: Array.isArray(bundleData.product.variants)
                            ? bundleData.product.variants.map((variant) => ({
                                  ...variant,
                                  manage_inventory: true,
                                  inventory_items: inventoryItemIds,
                              }))
                            : [],
                    },
                ],
            },
        });

        createRemoteLinkStep([
            {
                [BUNDLED_PRODUCT_MODULE]: {
                    bundle_id: bundle.id,
                },
                [Modules.PRODUCT]: {
                    product_id: bundleProduct[0].id,
                },
            },
        ]);

        const bundleProducttemLinks = transform(
            {
                bundleData,
                bundleItems,
            },
            (data) => {
                return data.bundleItems.map((item, index) => ({
                    [BUNDLED_PRODUCT_MODULE]: {
                        bundle_item_id: item.id,
                    },
                    [Modules.PRODUCT]: {
                        product_id: data.bundleData.items[index].product_id,
                    },
                }));
            }
        );

        createRemoteLinkStep(bundleProducttemLinks).config({
            name: "create-bundle-product-items-links",
        });

        // retrieve bundled product with items
        // @ts-ignore
        const { data } = useQueryGraphStep({
            entity: "bundle",
            fields: ["*", "items.*"],
            filters: {
                id: bundle.id,
            },
        }).config({ name: "get-final-bundle-data" });

        return new WorkflowResponse(data[0]);
    }
);
