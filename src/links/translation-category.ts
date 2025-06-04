import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import CategoryTranslation from "../modules/category-translations";

export default defineLink(
  {
    linkable: CategoryTranslation.linkable.categoryTranslation,
    field: "category_id",
    isList: false,
  },
  ProductModule.linkable.productCategory,
  {
    readOnly: true,
  }
);
