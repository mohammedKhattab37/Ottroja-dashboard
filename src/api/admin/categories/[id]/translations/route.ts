import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CATEGORY_TRANSLATION_MODULE } from "../../../../../modules/category-translations";
import CategoryTranslationService from "../../../../../modules/category-translations/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;

  const categoryTranslationService =
    req.scope.resolve<CategoryTranslationService>(CATEGORY_TRANSLATION_MODULE);
  const translations = await categoryTranslationService.getAllTranslations(id);

  res.status(200).json(translations);
}
