import { model } from "@medusajs/framework/utils";

const languageCodesEnum = ["AR", "RU"];

const ProductTranslation = model.define("product_translation", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  language_code: model.enum(languageCodesEnum),
  title: model.text(),
  sub_title: model.text().nullable(),
  description: model.text(),
});

ProductTranslation.indexes([
  {
    name: "product_translation_lookup_idx",
    on: ["product_id", "language_code"],
    unique: true,
  },
]);

export default ProductTranslation;
