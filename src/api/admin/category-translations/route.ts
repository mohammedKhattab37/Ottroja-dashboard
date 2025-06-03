import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CATEGORY_TRANSLATION_MODULE } from "../../../modules/category-translations";
import CategoryTranslationService, {
  CreateCategoryTranslationDTO,
} from "../../../modules/category-translations/service";
import { categoryTranslationSchema } from "./validators";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedTranslation = categoryTranslationSchema.parse(req.body);

  const categoryTranslationService =
    req.scope.resolve<CategoryTranslationService>(CATEGORY_TRANSLATION_MODULE);

  const result = await categoryTranslationService.createCategoryTranslation({
    ...validatedTranslation,
  });

  res.status(200).json({ translation: result });
}
