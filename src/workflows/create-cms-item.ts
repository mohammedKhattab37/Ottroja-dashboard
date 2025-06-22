import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CreateCMSItemStep } from "./steps/create-cms-item-step";

export type CreateCMSItemInput = {
  name: string;
  region: string;
  language: string;
  position: string;
  title: string | null;
  sub_title: string | null;
  content: string | null;
  button_destination: string | null;
  button_text: string | null;
  items: {
    [key: string]: {
      title: string;
      url?: string;
    };
  };
  images: string[];
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
