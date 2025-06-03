import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_TRANSLATION_MODULE } from "../../../../modules/product-translations";
import ProductTranslationService, {
  UpdateProductTranslationDTO,
} from "../../../../modules/product-translations/service";
import { productTranslationSchema } from "../validators";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { translation_id } = req.params;

  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);

  const result = await productTranslationService.deleteTranslation(
    translation_id
  );

  res.status(200).json({ translation: result });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { translation_id } = req.params;
  const validatedTranslation = productTranslationSchema.parse(req.body);

  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);
  const result = await productTranslationService.updateProductTranslation(
    translation_id,
    validatedTranslation
  );

  res.status(200).json({ translation: result });
}
