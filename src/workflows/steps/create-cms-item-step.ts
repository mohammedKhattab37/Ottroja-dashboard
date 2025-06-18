import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { CreateCMSItemInput } from "../create-cms-item";
import CMSItemModuleService from "../../modules/cms/service";
import { CMS_MODULE } from "../../modules/cms";

export const CreateCMSItemStep = createStep(
  "create-cms-item-step",

  async (input: CreateCMSItemInput, { container }) => {
    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);
    const item = await cmsModuleService.createCMSItems(input);

    return new StepResponse(item, item.id);
  },

  async (itemId, { container }) => {
    if (!itemId) return;

    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);

    await cmsModuleService.deleteCMSItems(itemId);
  }
);
