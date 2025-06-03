import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_TRANSLATION_MODULE } from "../../../../../modules/product-translations";
import ProductTranslationService from "../../../../../modules/product-translations/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);
  const translations =
    await productTranslationService.getAllProductTranslations(id);

  res.status(200).json(translations);
}
