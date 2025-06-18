import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { UpdateCMSItemStep } from "./steps/update-cms-item-step";

export type UpdateCMSItemInput = {
  id: string;
  name: string;
  title: string | null;
  eng_content: string | null;
  ar_content: string | null;
  items: {
    [key: string]: {
      title: string;
      url?: string;
    };
  };
  images: string[];
};

export const updateCMSItemWorkflow = createWorkflow(
  "update-cms-item",
  (input: UpdateCMSItemInput) => {
    const item = UpdateCMSItemStep(input);

    return new WorkflowResponse(item);
  }
);
