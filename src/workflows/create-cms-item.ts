import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CreateCMSItemStep } from "./steps/create-cms-item-step";

export type CreateCMSItemInput = {
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
