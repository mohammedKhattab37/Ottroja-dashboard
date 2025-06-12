import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { CMS_MODULE } from "../../../../modules/cms";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { itemId } = req.params;

  const cmsService = req.scope.resolve(CMS_MODULE);
  const cmsItem = await cmsService.listCMSItems({ id: itemId });

  res.json({
    cms_item: cmsItem[0],
  });
}
