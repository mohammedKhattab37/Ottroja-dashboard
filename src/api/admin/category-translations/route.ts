import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CATEGORY_TRANSLATION_MODULE } from "../../../modules/category-translations";
import CategoryTranslationService, {
  CreateCategoryTranslationDTO,
} from "../../../modules/category-translations/service";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { translation } = req.body as {
    translation: CreateCategoryTranslationDTO;
  };
  const categoryTranslationService =
    req.scope.resolve<CategoryTranslationService>(CATEGORY_TRANSLATION_MODULE);

  const result = await categoryTranslationService.createCategoryTranslation({
    ...translation,
  });

  res.status(200).json({ translation: result });
}
