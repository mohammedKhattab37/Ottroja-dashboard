import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { z } from "zod";
import { updateBundledProductStep } from "./steps/update-bundled-product";

export const UpdateBundledProductWorkflowInputSchema = z.object({
    id: z.string(),
    bundle: z.object({
        title: z.string().optional(),
    }),
});

export type UpdateBundledProductWorkflowInput = z.infer<
    typeof UpdateBundledProductWorkflowInputSchema
>;

export const updateBundledProductWorkflow = createWorkflow(
    "update-bundled-product",
    function (input: UpdateBundledProductWorkflowInput) {
        const updatedBundle = updateBundledProductStep(input);

        return new WorkflowResponse(updatedBundle);
    }
);
