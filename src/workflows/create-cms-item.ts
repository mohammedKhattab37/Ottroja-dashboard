import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CreateCMSItemStep } from "./steps/create-cms-item-step";

export type CreateCMSItemInput = {
  name: string;
  title: string | null;
  content: string | null;
  items: Array<{
    title: string;
    url?: string;
  }> | null;
};

export const createCMSItemWorkflow = createWorkflow(
  "create-cms-item",
  (input: CreateCMSItemInput) => {
    const item = CreateCMSItemStep(input);
    return new WorkflowResponse({
      item,
    });
  }
);
