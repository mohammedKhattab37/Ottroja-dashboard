import { MedusaService } from "@medusajs/framework/utils";
import ProductTranslation from "./models/product-translation";

export interface CreateProductTranslationDTO {
  product_id: string;
  language_code: string;
  title: string;
  sub_title?: string;
  description: string;
}

export interface UpdateProductTranslationDTO {
  language_code: string;
  title: string;
  sub_title?: string;
  description: string;
}

class ProductTranslationService extends MedusaService({
  ProductTranslation,
}) {
  async createProductTranslation(data: CreateProductTranslationDTO) {
    return await this.createProductTranslations(data);
  }

  async updateProductTranslation(
    translation_id: string,
    data: UpdateProductTranslationDTO
  ) {
    const [translation] = await this.listProductTranslations({
      id: translation_id,
      language_code: data.language_code,
    });

    return await this.updateProductTranslations({
      id: translation.id,
      ...data,
    });
  }

  async getTranslationByCode(product_id: string, language_code: string) {
    const [translation] = await this.listProductTranslations({
      product_id,
      language_code,
    });
    return translation;
  }

  async getTranslation(product_id: string, translation_id: string) {
    const [translation] = await this.listProductTranslations({
      id: translation_id,
      product_id,
    });
    return translation;
  }

  async getAllProductTranslations(product_id: string) {
    const translations = await this.listProductTranslations({
      product_id,
    });
    return translations;
  }

  async deleteAllProductTranslations(product_id: string) {
    const translations = await this.listProductTranslations({ product_id });
    const deletePromises = translations.map((t) =>
      this.deleteProductTranslations(t.id)
    );
    return await Promise.all(deletePromises);
  }

  async deleteTranslation(translation_id: string) {
    const translation = await this.deleteProductTranslations(translation_id);
    return translation;
  }
}

export default ProductTranslationService;
