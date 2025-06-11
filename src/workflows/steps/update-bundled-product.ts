import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import BundledProductModuleService from "../../modules/bundled-product/service";
import { BUNDLED_PRODUCT_MODULE } from "../../modules/bundled-product";
import { UpdateBundledProductWorkflowInput } from "../update-bundled-product";

export const updateBundledProductStep = createStep(
    "update-bundled-product",
    async (
        { id, bundle }: UpdateBundledProductWorkflowInput,
        { container }
    ) => {
        const bundledProductModuleService: BundledProductModuleService =
            container.resolve(BUNDLED_PRODUCT_MODULE);

        const query = container.resolve("query");

        // Get current bundle data for rollback
        const { data: currentBundle } = await query.graph({
            entity: "bundle",
            filters: { id },
            fields: ["id", "title"],
        });

        if (!currentBundle?.length) {
            throw new Error(`Bundle with ID ${id} not found`);
        }

        const currentBundleData = currentBundle[0];

        // Update bundle title if provided
        if (bundle.title !== undefined) {
            await bundledProductModuleService.updateBundles({
                selector: { id },
                data: { title: bundle.title },
            });
        }

        // Get updated bundle
        const { data: finalBundle } = await query.graph({
            entity: "bundle",
            filters: { id },
            fields: ["id", "title", "product.*", "items.*", "items.product.*"],
        });

        return new StepResponse(finalBundle[0], {
            bundleId: id,
            previousTitle: currentBundleData.title,
        });
    },
    async (rollbackData, { container }) => {
        if (!rollbackData) {
            return;
        }

        const bundledProductModuleService: BundledProductModuleService =
            container.resolve(BUNDLED_PRODUCT_MODULE);

        const { bundleId, previousTitle } = rollbackData;

        // Restore previous bundle title
        await bundledProductModuleService.updateBundles({
            selector: { id: bundleId },
            data: { title: previousTitle },
        });
    }
);
