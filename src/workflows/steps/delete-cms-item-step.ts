import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import CMSItemModuleService from "../../modules/cms/service";
import { CMS_MODULE } from "../../modules/cms";

export const DeleteCMSItemStep = createStep(
  "delete-cms-item-step",

  async (itemId: string, { container }) => {
    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);

    const previousData = await cmsModuleService.retrieveCMSItem(itemId);
    await cmsModuleService.deleteCMSItems(itemId);

    return new StepResponse(previousData, previousData);
  },

  async (item, { container }) => {
    if (!item) return;

    const cmsModuleService: CMSItemModuleService =
      container.resolve(CMS_MODULE);

    await cmsModuleService.createCMSItems(item);
  }
);
