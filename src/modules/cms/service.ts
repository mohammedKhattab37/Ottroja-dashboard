import { MedusaService } from "@medusajs/framework/utils";
import CMSItem from "./models/cms-item";

export default class CMSItemModuleService extends MedusaService({
  CMSItem,
}) {}
