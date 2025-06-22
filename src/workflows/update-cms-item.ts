import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { UpdateCMSItemStep } from "./steps/update-cms-item-step";

export type UpdateCMSItemInput = {
  id: string;
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

export const updateCMSItemWorkflow = createWorkflow(
  "update-cms-item",
  (input: UpdateCMSItemInput) => {
    const item = UpdateCMSItemStep(input);

    return new WorkflowResponse(item);
  }
);
