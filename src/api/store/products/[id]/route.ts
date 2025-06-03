import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { PRODUCT_TRANSLATION_MODULE } from "../../../../modules/product-translations";
import ProductTranslationService from "../../../../modules/product-translations/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const languageCode = req.headers["accept-language"] || "EN";

  const productModuleService = req.scope.resolve(Modules.PRODUCT);
  const productTranslationService =
      req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);

  const product = await productModuleService.retrieveProduct(id, {
    relations: ["variants"],
  });

  const translation = await productTranslationService.getTranslationByCode(
    id,
    languageCode
  );

  const localizedProduct = {
    ...product,
    translation: translation,
  };

  res.status(200).json({ product: localizedProduct });
}
