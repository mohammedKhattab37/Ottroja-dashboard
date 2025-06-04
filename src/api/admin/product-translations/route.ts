import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_TRANSLATION_MODULE } from "../../../modules/product-translations";
import ProductTranslationService, {
  CreateProductTranslationDTO,
} from "../../../modules/product-translations/service";
import { productTranslationSchema } from "./validators";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedTranslation = productTranslationSchema.parse(req.body);
  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);

  const result = await productTranslationService.createProductTranslation({
    ...validatedTranslation,
  });

  res.status(200).json({ translation: result });
}
