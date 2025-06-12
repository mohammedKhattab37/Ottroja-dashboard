import { model } from "@medusajs/framework/utils";

const CMSItem = model.define("cms_item", {
  id: model.id().primaryKey(),
  name: model.text().unique(),
  title: model.text().nullable(),
  content: model.text().nullable(),
  //images: model.array().nullable(),
  items: model.json().nullable(),
});

export default CMSItem;
