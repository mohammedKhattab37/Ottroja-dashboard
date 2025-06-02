import { model } from "@medusajs/framework/utils";

const languageCodesEnum = ["EN", "ES", "FR", "DE", "IT", "AR", "RU"];

const ProductTranslation = model.define("product_translation", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  language_code: model.enum(languageCodesEnum),
  title: model.text().nullable(),
  description: model.text().nullable(),
});

ProductTranslation.indexes([
  {
    name: "product_translation_lookup_idx",
    on: ["product_id", "language_code"],
    unique: true,
  },
]);

export default ProductTranslation;
