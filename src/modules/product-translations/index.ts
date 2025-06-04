import ProductTranslationService from "./service";
import { Module } from "@medusajs/framework/utils";

export const PRODUCT_TRANSLATION_MODULE = "productTranslation";

export default Module(PRODUCT_TRANSLATION_MODULE, {
  service: ProductTranslationService,
});
