import CategoryTranslationService from "./service";
import { Module } from "@medusajs/framework/utils";

export const CATEGORY_TRANSLATION_MODULE = "categoryTranslation";

export default Module(CATEGORY_TRANSLATION_MODULE, {
  service: CategoryTranslationService,
});
