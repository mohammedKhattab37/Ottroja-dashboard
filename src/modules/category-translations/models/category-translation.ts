import { model } from "@medusajs/framework/utils";

const languageCodesEnum = ["AR", "RU"];

const CategoryTranslation = model.define("category_translation", {
  id: model.id().primaryKey(),
  category_id: model.text(),
  language_code: model.enum(languageCodesEnum),
  name: model.text(),
  description: model.text(),
});

CategoryTranslation.indexes([
  {
    name: "category_translation_lookup_idx",
    on: ["category_id", "language_code"],
    unique: true,
  },
]);

export default CategoryTranslation;
