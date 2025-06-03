import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_TRANSLATION_MODULE } from "../../../modules/product-translations";
import ProductTranslationService, {
  CreateProductTranslationDTO,
} from "../../../modules/product-translations/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { translation } = req.body as {
    translation: CreateProductTranslationDTO;
  };
  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);

  const result = await productTranslationService.createProductTranslation({
    ...translation,
  });

  res.status(200).json({ translation: result });
}
