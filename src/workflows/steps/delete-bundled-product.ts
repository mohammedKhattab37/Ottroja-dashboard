import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import BundledProductModuleService from "../../modules/bundled-product/service";
import { BUNDLED_PRODUCT_MODULE } from "../../modules/bundled-product";
import { DeleteBundledProductWorkflowInput } from "../delete-bundled-product";

export const deleteBundledProductStep = createStep(
    "delete-bundled-product",
    async ({ id }: DeleteBundledProductWorkflowInput, { container }) => {
        const bundledProductModuleService: BundledProductModuleService =
            container.resolve(BUNDLED_PRODUCT_MODULE);

        const query = container.resolve("query");

        // Check if bundle exists
        const { data: bundleData } = await query.graph({
            entity: "bundle",
            filters: { id },
            fields: ["id", "title", "items.*"],
        });

        if (!bundleData?.length) {
            throw new Error(`Bundle with ID ${id} not found`);
        }

        const bundle = bundleData[0];

        // First delete all bundle items to avoid foreign key constraint issues
        if (bundle.items && bundle.items.length > 0) {
            const itemIds = bundle.items.map((item: any) => item.id);
            await bundledProductModuleService.deleteBundleItems(itemIds);
        }

        // Then delete the bundle
        await bundledProductModuleService.deleteBundles(id);

        return new StepResponse({ id, deleted: true });
    }
);
