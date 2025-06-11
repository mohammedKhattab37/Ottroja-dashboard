import {
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { z } from "zod";
import { deleteBundledProductStep } from "./steps/delete-bundled-product";

export const DeleteBundledProductWorkflowInputSchema = z.object({
    id: z.string(),
});

export type DeleteBundledProductWorkflowInput = z.infer<
    typeof DeleteBundledProductWorkflowInputSchema
>;

export const deleteBundledProductWorkflow = createWorkflow(
    "delete-bundled-product",
    function (input: DeleteBundledProductWorkflowInput) {
        const result = deleteBundledProductStep(input);

        return new WorkflowResponse(result);
    }
);
