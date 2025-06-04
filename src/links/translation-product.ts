import { defineLink } from "@medusajs/framework/utils";
import ProductModule from "@medusajs/medusa/product";
import ProductTranslation from "../modules/product-translations";

export default defineLink(
  {
    linkable: ProductTranslation.linkable.productTranslation,
    field: "product_id",
    isList: false,
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  }
);
