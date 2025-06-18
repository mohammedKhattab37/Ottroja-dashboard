import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { UpdateCMSItemInput } from "../update-cms-item";
import CMSItemModuleService from "../../modules/cms/service";
import { CMS_MODULE } from "../../modules/cms";

export const UpdateCMSItemStep = createStep(
  "update-cms-item-step",

  async (input: UpdateCMSItemInput, { container }) => {
    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);

    const oldItem = await cmsModuleService.retrieveCMSItem(input.id);
    const newItem = await cmsModuleService.updateCMSItems(input);

    return new StepResponse(newItem, oldItem);
  },

  async (oldItem, { container }) => {
    if (!oldItem) return;

    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);

    await cmsModuleService.updateCMSItems({ id: oldItem.id }, oldItem);
  }
);
