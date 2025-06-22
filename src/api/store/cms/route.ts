import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../modules/cms";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const languageCode = req.headers["accept-language"];
  const countryCode = req.headers["accept-country"];

  const cmsModuleService = req.scope.resolve(CMS_MODULE);
  const filter: Record<string, string> = {};
  if (languageCode) filter.language = String(languageCode);
  if (countryCode) filter.region = String(countryCode);

  const cmsItems = await cmsModuleService.listCMSItems(filter);

  res.status(200).json({ items: cmsItems });
}
