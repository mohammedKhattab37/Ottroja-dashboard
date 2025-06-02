import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { PRODUCT_TRANSLATION_MODULE } from "../../../../modules/product-translations";
import ProductTranslationService, {
  UpdateProductTranslationDTO,
} from "../../../../modules/product-translations/service";

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
  const { translation } = req.body as {
    translation: UpdateProductTranslationDTO;
  };

  const productTranslationService =
    req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);
  const result = await productTranslationService.updateProductTranslation(
    translation_id,
    translation
  );

  res.status(200).json({ translation: result });
}
