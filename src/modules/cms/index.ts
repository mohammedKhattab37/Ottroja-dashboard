import CMSItemService from "./service";
import { Module } from "@medusajs/framework/utils";

export const CMS_MODULE = "cmsItem";

export default Module(CMS_MODULE, {
  service: CMSItemService,
});
