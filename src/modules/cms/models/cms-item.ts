import { model } from "@medusajs/framework/utils";

const regionsCodesEnum = ["EG", "SA"];
const languagesCodesEnum = ["AR", "EN", "RU"];
const positionEnum = [
  "NAV_LINKS",
  "HERO",
  "SPECIAL_OFFERS",
  "OFFER_BANNER1",
  "SUB_OFFERS",
  "IMAGES_GALLERY",
  "OFFER_BANNER2",
  "FOOTER",
  "PAGE",
];
const pageTypeEnum = ["RETURN_POLICY", "USAGE_POLICY", "TERMS_CONDITIONS"];

const CMSItem = model.define("cms_item", {
  id: model.id().primaryKey(),
  position: model.enum(positionEnum),
  language: model.enum(languagesCodesEnum),
  name: model.text().unique(),
  page_type: model.enum(pageTypeEnum).nullable(),
  title: model.text().nullable(),
  sub_title: model.text().nullable(),
  region: model.enum(regionsCodesEnum),
  content: model.text().nullable(),
  button_destination: model.text().nullable(),
  button_text: model.text().nullable(),
  images: model.array().nullable(),
  items: model.json().nullable(),
});

export default CMSItem;
