import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CATEGORY_TRANSLATION_MODULE } from "../../../../modules/category-translations";
import CategoryTranslationService, {
  UpdateCategoryTranslationDTO,
} from "../../../../modules/category-translations/service";
import { categoryTranslationSchema } from "../validators";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { translation_id } = req.params;

  const categoryTranslationService =
    req.scope.resolve<CategoryTranslationService>(CATEGORY_TRANSLATION_MODULE);

  const result = await categoryTranslationService.deleteTranslation(
    translation_id
  );

  res.status(200).json({ translation: result });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { translation_id } = req.params;
  const validatedTranslation = categoryTranslationSchema.parse(req.body);

  const categoryTranslationService =
    req.scope.resolve<CategoryTranslationService>(CATEGORY_TRANSLATION_MODULE);
  const result = await categoryTranslationService.updateCategoryTranslation(
    translation_id,
    validatedTranslation
  );

  res.status(200).json({ translation: result });
}
