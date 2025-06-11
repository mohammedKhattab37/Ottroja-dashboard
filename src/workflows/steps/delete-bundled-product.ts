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
            fields: ["id", "title"],
        });

        if (!bundleData?.length) {
            throw new Error(`Bundle with ID ${id} not found`);
        }

        // Delete the bundle (items should cascade delete based on model relationship)
        await bundledProductModuleService.deleteBundles(id);

        return new StepResponse({ id, deleted: true });
    }
);
