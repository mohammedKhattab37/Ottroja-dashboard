import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { DeleteCMSItemStep } from "./steps/delete-cms-item-step";

export const deleteCMSItemWorkflow = createWorkflow(
  "delete-cms-item",
  (itemId: string) => {
    const item = DeleteCMSItemStep(itemId);
    return new WorkflowResponse({
      item,
    });
  }
);
