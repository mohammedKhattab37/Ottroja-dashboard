import { MedusaService } from "@medusajs/framework/utils";
import CategoryTranslation from "./models/category-translation";

export interface CreateCategoryTranslationDTO {
  category_id: string;
  language_code: string;
  name: string;
  description: string;
}

export interface UpdateCategoryTranslationDTO {
  language_code: string;
  name: string;
  description: string;
}

class CategoryTranslationService extends MedusaService({
  CategoryTranslation,
}) {
  async createCategoryTranslation(data: CreateCategoryTranslationDTO) {
    return await this.createCategoryTranslations(data);
  }

  async updateCategoryTranslation(
    translation_id: string,
    data: UpdateCategoryTranslationDTO
  ) {
    const [translation] = await this.listCategoryTranslations({
      id: translation_id,
      language_code: data.language_code,
    });

    return await this.updateCategoryTranslations({
      id: translation.id,
      ...data,
    });
  }

  async getTranslationByCode(category_id: string, language_code: string) {
    const [translation] = await this.listCategoryTranslations({
      category_id,
      language_code,
    });
    return translation;
  }

  async getAllTranslations(category_id: string) {
    const translations = await this.listCategoryTranslations({
      category_id,
    });
    return translations;
  }

  async deleteAllCategoryTranslations(category_id: string) {
    const translations = await this.listCategoryTranslations({ category_id });
    const deletePromises = translations.map((t) =>
      this.deleteCategoryTranslations(t.id)
    );
    return await Promise.all(deletePromises);
  }

  async deleteTranslation(translation_id: string) {
    const translation = await this.deleteCategoryTranslations(translation_id);
    return translation;
  }
}

export default CategoryTranslationService;
