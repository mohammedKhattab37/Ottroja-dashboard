import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { PRODUCT_TRANSLATION_MODULE } from "../../../modules/product-translations";
import ProductTranslationService from "../../../modules/product-translations/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const languageCode = req.headers["accept-language"] || "EN";
  
  // Extract query parameters for filtering, pagination, etc.
  const {
    limit = 20,
    offset = 0,
    fields,
    expand,
    ...filters
  } = req.query;

  const productModuleService = req.scope.resolve(Modules.PRODUCT);
  const productTranslationService =
      req.scope.resolve<ProductTranslationService>(PRODUCT_TRANSLATION_MODULE);

  // Build the config object for the query
  const config: any = {
    take: Number(limit),
    skip: Number(offset),
    relations: ["variants"],
  };

  // Handle fields selection if provided
  if (fields) {
    if (typeof fields === 'string') {
      config.select = fields.split(',');
    } else if (Array.isArray(fields)) {
      config.select = fields as string[];
    }
  }

  // Retrieve products with any filters and pagination
  const [products, count] = await productModuleService.listAndCountProducts(
    filters,
    config
  );

  // Get translations for all products
  const productIds = products.map(product => product.id);
  const translations = await productTranslationService.getTranslationsByCodes(
    productIds,
    languageCode
  );

  // Create a map for quick translation lookup
  const translationMap = new Map();
  translations.forEach(translation => {
    translationMap.set(translation.product_id, translation);
  });

  // Attach translations to products
  const localizedProducts = products.map(product => ({
    ...product,
    translation: translationMap.get(product.id) || null,
  }));

  res.status(200).json({ 
    products: localizedProducts,
    count,
    offset: Number(offset),
    limit: Number(limit)
  });
} 