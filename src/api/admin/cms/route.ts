import { createCMSItemWorkflow } from "./../../../workflows/create-cms-item";
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { cmsItemSchema } from "./validators";
import { CMS_MODULE } from "../../../modules/cms";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cmsService = req.scope.resolve(CMS_MODULE);
  const cmsItems = await cmsService.listCMSItems();

  res.json({
    cms_items: cmsItems,
  });
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const input = cmsItemSchema.parse(req.body);
  console.log(input.position);

  const { result } = await createCMSItemWorkflow(req.scope).run({
    input: {
      ...input,
      items: input.items || {},
      images: input.images || [],
    },
  });

  res.json(result);
};
